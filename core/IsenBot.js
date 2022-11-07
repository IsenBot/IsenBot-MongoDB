const { Client, Collection/* , MessageEmbed*/ } = require('discord.js');

const { MongoClient } = require('mongodb');
const { Player } = require('discord-player');
const BlaguesAPI = require('blagues-api');

const Logger = require('./Log');
const { formatLog } = require('../utility/Log');

const path = require('path');
const fs = require('fs');

class IsenBot extends Client {
    constructor(options) {
        super(options);
        // Store the config of the bot like token.
        this.config = require('../config');
        // Client to connect to the database.
        this.mongodb = new MongoClient(this.config.mongodbUri);
        // Create the music player
        this.player = new Player(this, {
            ytdlOptions: {
                quality: 'highestaudio',
                highWaterMark: 1 << 25,
            },
        });
        // Store the blaguesAPI token and the last joke
        this.blagues = new BlaguesAPI(this.config.apiKeys.blagues);
        // The root path of the command exe
        this.commandsExePath = {
            root : path.resolve('./commands/exe/'),
            ext : '.js',
        };
        this.commandsBuilderPath = path.resolve('./commands/builder');
        // Contain all the command of the bot
        this.commands = new Collection();
        // The client's logger
        this.logger = undefined;

        this.languagesMeta = require('../languages/languages-meta.json');
        this.languageCache = new Collection();
    }
    static async create(options) {
        const client = new this(options);
        client.logger = await Logger.create(this, { logChannelId : this.config.log.globalLogChannelId });
    }

    // Return the default bot language for all translation.
    get defaultLanguageMeta() {
        const language = this.languagesMeta.filter(languageMeta => languageMeta.default);
        return language.length > 0 ? language[0] : undefined;
    }
    // Return the lang-meta part that match the given name
    getLanguageMeta(languageName) {
        const language = this.languagesMeta.filter(languageMeta => (languageMeta.name === languageName) || (languageMeta.aliases.includes(languageName)));
        return language.length > 0 ? language[0] : this.defaultLanguageMeta;
    }

    // Set up Logger for all guild and the global logger.
    async createLoggers() {
        const mongodb = this.mongodb;
        try {
            mongodb.connect();

            const database = mongodb.db('database_name');
            const guildsCollection = database.collection('guild');
            const query = {};
            const projection = { id_ : 1, logChannelId : 1 };

            const guildsData = guildsCollection.find(query).project(projection);

            for await (const guildData of guildsData) {
                const guild = this.guilds.cache.get(guildData['_id']);
                if (!guild) {
                    // TODO : Maybe delete the guild from the database if the client cant access it anymore
                    return;
                }
                if (!(guild.logger)) {
                    guild.logger = await Logger.create(this, { guild, logChannelId: guildData.logChannelId });
                }
            }
        } finally {
            // Ensures that the client will close when you finish/error
            mongodb.close();
        }
    }
    // Get the logChannel channel from the database for the given guild and then return the fetched logChannel on discord.
    // Remove the logChannel from the logger and the database for the given guild.
    async removeLogChannel(guild) {
        this.guild.logger.removeLogChannel();
        const mongodb = this.mongodb;
        try {
            mongodb.connect();
            // Set the logChannelId for the guild to null in the database.
            const database = mongodb.db('database_name');
            const guildsCollection = database.collection('guild');
            const query = { _id: guild.id };
            const update = { logChannelId: null };
            await guildsCollection.updateOne(query, update);

        } finally {
            mongodb.close();
        }
    }
    // Execute a command file.
    executeCommand(interaction, command) {
        const commandPath = Object.assign({}, this.commandsExePath);
        const subCommandGroup = interaction.options.getSubcommandGroup(false);
        const subCommand = interaction.options.getSubcommand(false);
        commandPath.dir = path.join(commandPath.root, command.path);
        if (subCommand || subCommandGroup) {
            commandPath.dir = path.join(commandPath.dir, command.name);
            command = command.data;
            if (subCommandGroup) {
                for (const optionKey in command.options) {
                    if (command.options[optionKey].name) {
                        if (interaction.translate(command.options[optionKey].name) === subCommandGroup) {
                            command = command.options[optionKey];
                            commandPath.dir = path.join(commandPath.dir, interaction.client.translate(command.name, {}, 'en'));
                            break;
                        }
                    }
                }
            }
            if (subCommand) {
                for (const optionKey in command.options) {
                    if (command.options[optionKey].name) {
                        if (interaction.translate(command.options[optionKey].name) === subCommand) {
                            commandPath.name = interaction.client.translate(command.options[optionKey].name, {}, 'en');
                            break;
                        }
                    }
                }
            }

        } else {
            commandPath.name = interaction.client.translate(command.data.name, {}, 'en');
        }
        return (require(path.format(commandPath)))(interaction);
    }
    // Load the command in the client.
    async loadCommand() {
        const mongodb = this.mongodb;
        const client = this;
        const commandsBuilderPath = client.commandsBuilderPath;

        try {
            mongodb.connect();
            // Get the guild language from database
            const database = mongodb.db('database_name');
            const guildsCollection = database.collection('guild');
            const query = {};
            const projection = { id_ : 1, language : 1 };
            const guildsData = guildsCollection.find(query).project(projection);

            await client.logger.log({
                textContent: 'Loading commands ...',
                headers: 'CommandLoader',
                type: 'event',
            });
            // Iterate over each guild language
            const dirs = fs.readdirSync(commandsBuilderPath);
            const langList = [];
            const ignoreList = [];
            for await (const guildData of guildsData) {
                const language = guildData.language;
                if (!(langList.includes(language))) {
                    langList.push(language);
                    // Iterate over all command builder file
                    for (const dir of dirs) {
                        const commandFiles = fs.readdirSync(`${commandsBuilderPath}/${dir}`).filter(file => (file.endsWith('.js')));
                        for (const commandFile of commandFiles) {
                            if (!ignoreList.includes(commandFile.split('.js')[0])) {
                                await client.logger.log({
                                    textContent: formatLog('Loading command ...', {
                                        'Command': commandFile,
                                        'Language': language,
                                    }),
                                    headers: 'CommandLoader',
                                    type: 'log',
                                });
                                // Get the command builder file
                                const command = require(`${commandsBuilderPath}/${dir}/${commandFile}`);
                                try {
                                    client.commands.set(client.translate(command.data.name, {}, language), command);
                                } catch (e) {
                                    if (e !== 'Not a path') {
                                        throw e;
                                    }
                                    ignoreList.push(command.data.name);
                                    client.commands.set(command.data.name, command);
                                }
                            }
                        }
                    }
                }
            }
            await client.logger.log({
                textContent: 'All commands load',
                headers: 'CommandLoader',
                type: 'success',
            });
        } finally {
            // Ensures that the client will close when you finish/error
            mongodb.close();
        }
    }

    // replace {{variable}} in the string according to the given object {variable: value}, can have multiple variable
    replaceVariable(string, variablesObject) {
        // TODO : Put the wrapper config in the config ?
        const leftWrapper = '{{';
        const rightWrapper = '{{';
        const regex = new RegExp(`${leftWrapper}([\\w-]+)${rightWrapper}`, 'g');
        return string.replaceAll(regex, (match, variableName) => Object.hasOwn(variablesObject, variableName) ? variablesObject[variableName] : match);
    }
    // Get the message component based on the lang and the path (separator : ":") (also cache it to get it again faster)
    // TODO : test if it work
    translate(messageComponentPath, args = {}, languageName = this.defaultLanguageMeta.name) {
        const regex = /:(?=\w)/g;
        messageComponentPath = messageComponentPath.split(regex);
        if (messageComponentPath.length < 2) {
            throw 'Not a path';
        }
        const languageMeta = this.getLanguageMeta(languageName);
        if (!languageMeta) {
            return 'unknown';
        }
        if (!this.languageCache.has(languageMeta.name + '/' + messageComponentPath[0])) {
            const languageFilePath = './languages/' + languageMeta.name + '/' + messageComponentPath[0] + '.json';
            try {
                let data = fs.readFileSync(languageFilePath, 'utf8');
                data = JSON.parse(data);
                this.languageCache[languageMeta.name + '/' + messageComponentPath[0]] = data;
            } catch (err) {
                this.logger.log({
                    textContent: formatLog('Failed loading translation', { 'path' : `${languageMeta.name}/${messageComponentPath.join(':')}` }),
                    headers: 'Language',
                    type: 'error',
                });
                if (err.code !== 'ENOENT') { console.error(err); }
                return languageMeta === this.defaultLanguageMeta ? 'unknown' : this.translate(messageComponentPath.join(':'), args);
            }
        }
        let component = this.languageCache[languageMeta.name + '/' + messageComponentPath[0]];
        for (let i = 1; i < messageComponentPath.length; i++) {
            if (component) {
                component = component[messageComponentPath[i]];
            }
        }
        if (component) {
            return this.replaceVariable(component, args);
        }
        this.logger.log({
            textContent: formatLog('Failed loading translation', { 'path' : `${languageMeta.name}/${messageComponentPath.join(':')}` }),
            headers: 'Language',
            type: 'error',
        });
        return languageMeta === this.defaultLanguageMeta ? 'unknown' : this.translate(messageComponentPath.join(':'), args);
    }
}

module.exports = IsenBot;