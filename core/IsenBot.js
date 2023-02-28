const { Client, Collection, EmbedBuilder } = require('discord.js');

const { MongoClient } = require('mongodb');
const { Player } = require('discord-player');
const BlaguesAPI = require('blagues-api');

const Logger = require('./Log');
const { formatLog } = require('../utility/Log');

const CronTasker = require('./Cron');

const path = require('node:path');
const fs = require('node:fs');

// TODO : cache guildLanguage so we dont fetch it all the time

class IsenBot extends Client {
    #database;
    constructor(options) {
        super(options);
        // Store the config of the bot like token.
        this.config = require('../config');
        this.embedTemplate = new EmbedBuilder()
            .setColor(this.config.embed.color)
            .setThumbnail(this.config.embed.thumbnail);
        // Client to connect to the database.
        this.mongodb = new MongoClient(this.config.database.uri);
        this.#database = this.mongodb.db(this.config.database.databaseName);
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
            root : path.resolve(__dirname, '../commands-exe/'),
            ext : '.js',
        };
        this.commandsBuilderPath = path.resolve(__dirname, '../commands-builders/');
        this.eventsPath = path.resolve(__dirname, '../event');
        this.autoCompletePath = path.resolve(__dirname, '../interactions/autocomplete');
        this.buttonPath = path.resolve(__dirname, '../interactions/button');
        this.selectPath = path.resolve(__dirname, '../interactions/select');
        this.modalPath = path.resolve(__dirname, '../interactions/modal');
        // Contain all the command of the bot
        this.commands = new Collection();
        // The client's logger
        this.logger = undefined;
        this.tasks = new CronTasker(this);
        this.auth = undefined;
        this.api = undefined;

        this.languagesMeta = require('../languages/languages-meta.json');
        this.languageCache = new Collection();

        this.guildsCollection = this.#database.collection(this.config.database.guildTableName);
        this.roleReactCollection = this.#database.collection(this.config.database.rolesReactionsTableName);
        this.roleReactConfigCollection = this.#database.collection(this.config.database.rolesReactionsConfigTableName);
        this.hours = this.#database.collection(this.config.database.hoursTableName);
        this.messagesToDelete = this.#database.collection(this.config.database.messagesToDeleteTableName);
    }
    static async create(options) {
        const client = new this(options);
        client.logger = await Logger.create(client, { isClientLogger: true });
        const discordStartLogo =
            '    ..  ...  .  -.   -...  ---  -    \n\n' +
            '██╗███████╗███████╗███╗   ██╗         \n' +
            '██║██╔════╝██╔════╝████╗  ██║         \n' +
            '██║███████╗█████╗  ██╔██╗ ██║         \n' +
            '██║╚════██║██╔══╝  ██║╚██╗██║         \n' +
            '██║███████║███████╗██║ ╚████║         \n' +
            `╚═╝╚══════╝╚══════╝╚═╝  ╚═══╝  ${process.env.npm_package_version}\n` +
            '                                      \n' +
            '            ██████╗  ██████╗ ████████╗\n' +
            '            ██╔══██╗██╔═══██╗╚══██╔══╝\n' +
            '            ██████╔╝██║   ██║   ██║   \n' +
            '            ██╔══██╗██║   ██║   ██║   \n' +
            '            ██████╔╝╚██████╔╝   ██║   \n' +
            '            ╚═════╝  ╚═════╝    ╚═╝ \n\n' +
            '    ..  ...  .  -.   -...  ---  -    \n';
        client.log({
            textContent: discordStartLogo,
            isEmbed: false,
            isCodeBlock: true,
            isConsoleLog: false,
        });
        client.log({
            textContent: 'Login into database...',
            type: 'log',
        });
        await client.mongodb.connect();
        client.log({
            textContent: 'Database connection establish',
            type: 'success',
        });
        return client;
    }

    log = (...options) => {
        return this.logger.log(...options);
    };

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
    // Return an array of all the languages of the bot as discord readable locale id
    getLanguages() {
        const discordLocales = ['en-US', 'en-GB', 'bg', 'zh-CN', 'zh-TW', 'hr', 'cs', 'da', 'nl', 'fi', 'fr', 'de', 'el', 'hi', 'hu', 'it', 'ja', 'ko', 'lt', 'no', 'pl', 'pt-BR', 'ro', 'ru', 'es-ES', 'sv-SE', 'th', 'tr', 'uk', 'vi'];
        const result = {};
        for (const discordLocale of discordLocales) {
            for (const languageObject of this.languagesMeta) {
                if (languageObject.name === discordLocale || languageObject.aliases.includes(discordLocale)) {
                    result[discordLocale] = languageObject.name;
                }
            }
        }
        return result;
    }

    // Set up Logger for all guild and the global logger.
    async createLoggers() {
        const guildsCollection = this.guildsCollection;
        const query = {};
        const projection = { _id: 0, guildId: 1, logChannelId: 1 };

        const guildsData = guildsCollection.find(query).project(projection);

        for await (const guildData of guildsData) {
            const guild = this.guilds.cache.get(guildData.guildId);
            if (!guild) {
                // TODO : Maybe delete the guild from the database if the client cant access it anymore
                return;
            }
            if (!(guild.logger)) {
                guild.logger = await Logger.create(this, { guild, logChannelId: guildData.logChannelId });
            }
            guild.logger.emit('ready');
        }
    }
    // Get the logChannel channel from the database for the given guild and then return the fetched logChannel on discord.
    // Remove the logChannel from the logger and the database for the given guild.
    async removeLogChannel(guild) {
        this.guild.logger.removeLogChannel();
        // Set the logChannelId for the guild to null in the database.
        const guildsCollection = this.guildsCollection;
        const query = { _id: guild.id };
        const update = { logChannelId: null };
        await guildsCollection.updateOne(query, update);
    }
    // Execute a command file.
    executeCommand(interaction, category) {
        const commandPath = Object.assign({}, this.commandsExePath);
        const subCommandGroup = interaction.options.getSubcommandGroup(false);
        const subCommand = interaction.options.getSubcommand(false);
        commandPath.root = path.join(commandPath.root, category, interaction.commandName, subCommandGroup ?? '', subCommand ?? '');
        return (require(path.format(commandPath)))(interaction);
    }
    // Returns an autocomplete
    executeAutocomplete(interaction) {
        const commandPath = {};
        console.log(interaction.commandName);
        commandPath.dir = path.join(this.autoCompletePath, interaction.commandName);
        return (require(path.format(commandPath)))(interaction);
    }
    // Execute a button action
    executeButton(interaction) {
        const commandPath = {};
        commandPath.dir = path.join(this.buttonPath, interaction.customId);
        return (require(path.format(commandPath)))(interaction);
    }
    // Execute a select interaction
    executeSelect(interaction) {
        const commandPath = {};
        commandPath.dir = path.join(this.selectPath, interaction.customId);
        return (require(path.format(commandPath)))(interaction);
    }
    // Execute a modal submission
    executeModal(interaction) {
        const commandPath = {};
        commandPath.dir = path.join(this.modalPath, interaction.customId);
        return (require(path.format(commandPath)))(interaction);
    }
    // Load the command in the client.
    async loadCommand() {
        this.log({
            textContent: 'Loading commands ...',
            headers: 'CommandLoader',
            type: 'event',
        });
        // load each command
        const commandsBuilderPath = this.commandsBuilderPath;
        const dirs = fs.readdirSync(commandsBuilderPath);
        for (const dir of dirs) {
            const commandFiles = fs.readdirSync(`${commandsBuilderPath}/${dir}`).filter(file => (file.endsWith('.js')));
            for (const commandFile of commandFiles) {
                this.log({
                    textContent: formatLog('Loading command ...', {
                        'Command': commandFile,
                    }),
                    headers: 'CommandLoader',
                    type: 'log',
                });
                // Get the command builder file
                const command = require(`${commandsBuilderPath}/${dir}/${commandFile}`);
                this.commands.set(command.data.name, command.category);
            }
        }
        this.log({
            textContent: ' ... All commands loaded',
            headers: 'CommandLoader',
            type: 'success',
        });
    }

    loadEventHandler() {
        this.log({
            textContent: 'Loading events ...',
            headers: 'EventLoader',
            type: 'event',
        });
        fs.readdirSync(this.eventsPath).forEach(dirs => {
            const eventFiles = fs.readdirSync(`${this.eventsPath}/${dirs}`).filter(file => file.endsWith('.js'));
            const handler = (dirs === 'core' ? this : dirs === 'music' ? this.player : undefined);
            for (const file of eventFiles) {
                const event = require(`${this.eventsPath}/${dirs}/${file}`);
                if (event.once) {
                    this.once(event.name, (...args) => event.execute(...args));
                } else {
                    handler?.on(event.name, (...args) => event.execute(...args));
                }
            }
        });
        this.log({
            textContent: '... All events loaded',
            headers: 'EventLoader',
            type: 'success',
        });
    }

    loadTasksFromDB() {
        this.log({
            textContent: 'Loading tasks ...',
            headers: 'TaskLoader',
            type: 'event',
        });
        this.messagesToDelete.find().forEach(async messageToDelete => {
            const channel = await this.channels.fetch(messageToDelete.channelId);
            const message = await channel.messages.fetch(messageToDelete.messageId);
            this.tasks.addMessageToDelete(message, messageToDelete.deleteTimestamp, messageToDelete.id);
        });
        this.log({
            textContent: '... All tasks loaded',
            headers: 'TaskLoader',
            type: 'success',
        });
    }

    #parseMessageComponentPath(messageComponentPath) {
        const regex = /:(?=\w)/g;
        messageComponentPath = messageComponentPath.split(regex);
        if (messageComponentPath.length < 2) {
            throw 'Not a path';
        }
        return messageComponentPath.map((component, index) => index === 0 ? component : component.toUpperCase());
    }

    // replace {{variable}} in the string according to the given object {variable: value}, can have multiple variable
    replaceVariable(string, variablesObject) {
        const leftWrapper = '{{';
        const rightWrapper = '}}';
        const regex = new RegExp(`${leftWrapper}([\\w-]+)${rightWrapper}`, 'g');
        return string.replaceAll(regex, (match, variableName) => Object.hasOwn(variablesObject, variableName) ? variablesObject[variableName] : match);
    }

    // Get the message component based on the lang and the path (separator : ":") (also cache it to get it again faster)
    translate(messageComponentPath, args = {}, languageIdentifier = this.defaultLanguageMeta.name, allowEmpty = false) {
        messageComponentPath = this.#parseMessageComponentPath(messageComponentPath);
        const languageMeta = this.getLanguageMeta(languageIdentifier);
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
                this.log({
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
        } else if ((typeof component === 'string' || component instanceof String) && allowEmpty) {
            return component;
        }
        this.log({
            textContent: formatLog('Failed loading translation', { 'path' : `${languageMeta.name}/${messageComponentPath.join(':')}` }),
            headers: 'Language',
            type: 'error',
        });
        return languageMeta === this.defaultLanguageMeta ? 'unknown' : this.translate(messageComponentPath.join(':'), args);
    }

    getLocales(messageComponentPath, allowEmpty = true) {
        const localesMessageObject = {};
        const languagesObj = this.getLanguages();
        for (const [key, value] of Object.entries(languagesObj)) {
            localesMessageObject[key] = this.translate(messageComponentPath, {}, value, allowEmpty);
        }
        return localesMessageObject;
    }
}

module.exports = IsenBot;