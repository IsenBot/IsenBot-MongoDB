const fs = require('node:fs');
const { REST, Routes } = require('discord.js');

const { formatLog } = require('./Log');

// TODO : maybe opti
function translate(client, command, languageName) {
    const translatedCommand = Object.assign(Object.create(Object.getPrototypeOf(command)), command);
    if (translatedCommand.name) {
        try {
            translatedCommand.name = client.translate(translatedCommand.name, {}, languageName);
        } catch {
            null;
        }
    }
    if (translatedCommand.description) {
        try {
            translatedCommand.description = client.translate(translatedCommand.description, {}, languageName);
        } catch {
            null;
        }
    }
    if (translatedCommand.options) {
        translatedCommand.options = [];
        for (const optionsKey in command.options) {
            translatedCommand.options.push(translate(client, command.options[optionsKey], languageName));
        }
    }
    if (translatedCommand.choices) {
        translatedCommand.choices = [];
        for (const choicesKey in command.choices) {
            translatedCommand.choices.push(translate(client, command.choices[choicesKey], languageName));
        }
    }
    return translatedCommand;
}

module.exports = async function(client) {
    client.log({
        textContent: 'Start deploying commands ...',
        headers: 'DeployCommands',
        type: 'event',
    });
    const rest = new REST({ version: '10' }).setToken(client.config.token);
    const cache = {};

    const blacklist = client.config.dontDeploy;
    const commandPath = client.commandsBuilderPath;
    const rawCommands = [];

    fs.readdirSync(commandPath).forEach(dir => {
        const commandFiles = fs.readdirSync(`${commandPath}/${dir}`).filter(file => (file.endsWith('.js')) && !(blacklist.includes(file.slice(0, -3))));
        commandFiles.forEach(file => {
            const command = new Object(require(`${commandPath}/${dir}/${file}`));
            rawCommands.push(command.data);
        });
    });

    let success = 0;
    const failList = [];

    try {
        await client.mongodb.connect();
        const query = {};
        const projector = {
            _id: 1,
            language: 1,
        };

        for await (const guildData of client.guildsCollection.find(query).project(projector)) {
            const language = client.getLanguageMeta(guildData.language);
            // If the guild has no set language and the bot has no default language configure, then don't deploy the commands for this guild.
            if (!language) {
                continue;
            }
            client.log({
                textContent: formatLog('Registering application commands ...', { 'GuildId': guildData._id, 'Language': language.name }),
                headers: ['DeployCommands', 'Rest'],
                type: 'log',
            });
            let commands;
            if (Object.hasOwn(cache, language.name)) {
                commands = cache[language.name];
            } else {
                client.log({
                    textContent: formatLog('Translating commands ...', { 'Language': language.name }),
                    headers: ['DeployCommands', 'Translation'],
                    type: 'log',
                });
                commands = [];
                for (const command of rawCommands) {
                    const translatedCommand = translate(client, command, language.name);
                    commands.push(translatedCommand.toJSON());
                }
                client.log({
                    textContent: formatLog('... Commands translated', { 'Language': language.name }),
                    headers: ['DeployCommands', 'Translation'],
                    type: 'success',
                });
                cache[language.name] = commands;
            }

            try {
                // Register application commands on discord.
                await rest.put(Routes.applicationGuildCommands(client.application.id, guildData._id), { body: commands });
            } catch (e) {
                failList.push(guildData._id);
                client.log({
                    textContent: formatLog('Failed registering application commands', { 'GuildId': guildData._id }),
                    headers: ['DeployCommands', 'Rest'],
                    type: 'error',
                });
                console.error(e);
                // Don't log the success message since it failed
                continue;
            }
            success++;
            client.log({
                textContent: formatLog('... Application commands registered', { 'GuildId': guildData._id }),
                headers: ['DeployCommands', 'Rest'],
                type: 'log',
            });
        }
    } finally {
        client.mongodb.close();
    }
    if (failList.length === 0) {
        client.log({
            textContent: '... Commands deployed in all guilds',
            headers: 'DeployCommands',
            type: 'success',
        });
    } else if (success === 0) {
        client.log({
            textContent: formatLog('... Failed deploying commands in all guilds', { 'GuildsIdList': failList }),
            headers: 'DeployCommands',
            type: 'error',
        });
    } else {
        client.log({
            textContent: formatLog('... Commands deployed in some guild', { 'NumberOfSuccess': success, 'FailList': failList }),
            headers: 'DeployCommands',
            type: 'log',
        });
    }
};