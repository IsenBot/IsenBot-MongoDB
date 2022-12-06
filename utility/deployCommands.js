const fs = require('node:fs');
const { REST, Routes } = require('discord.js');

const { formatLog } = require('./Log');

module.exports = async function(client) {
    client.log({
        textContent: 'Start deploying commands ...',
        headers: 'DeployCommands',
        type: 'event',
    });
    const rest = new REST({ version: '10' }).setToken(client.config.token);

    const blacklist = client.config.dontDeploy;
    const commandPath = client.commandsBuilderPath;
    const commandsList = [];

    fs.readdirSync(commandPath).forEach(dir => {
        const commandFiles = fs.readdirSync(`${commandPath}/${dir}`).filter(file => (file.endsWith('.js')) && !(blacklist.includes(file.slice(0, -3))));
        commandFiles.forEach(file => {
            const command = new Object(require(`${commandPath}/${dir}/${file}`));
            commandsList.push(command.data);
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
            client.log({
                textContent: formatLog('Registering application commands ...', { 'GuildId': guildData._id}),
                headers: ['DeployCommands', 'Rest'],
                type: 'log',
            });
            try {
                // Register application commands on discord.
                await rest.put(Routes.applicationGuildCommands(client.application.id, guildData._id), { body: commandsList });
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