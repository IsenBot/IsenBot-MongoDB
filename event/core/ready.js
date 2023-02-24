const { formatLog } = require('../../utility/Log');
const { GuildSchema } = require('../../utility/Schema');
const Logger = require('../../core/Log');
const Auth = require('../../core/Auth');
const Api = require('../../core/Api');

async function checkNewGuild(client) {
    const guildsCollection = client.guildsCollection;
    const query = {};
    const projection = { _id: 0, guildId: 1 };
    const guildsId = await guildsCollection.find(query).project(projection).map(p => p.guildId).toArray();

    let change = false;
    for (const guild of client.guilds.cache.map(guildCache => guildCache)) {
        if (!guildsId.includes(guild.id)) {
            change = true;
            client.log({
                textContent: formatLog('New guild detected', { 'Id': guild.id, 'Name': guild.name }),
                headers: 'Ready',
                type: 'log',
            });
            await guildsCollection.insertOne(new GuildSchema({ guildId: guild.id }));
            guild.logger = await Logger.create(client, { guild });
        }
    }
    if (!change) {
        client.log({
            textContent: 'No new guild detected',
            headers: 'Ready',
            type: 'log',
        });
    }
}

function getUrl(guildId, channelId = undefined, messageId = undefined) {
    const baseUrl = 'https://discord.com/channels/';
    let link = baseUrl + guildId;
    if (channelId) {
        link += `/${channelId}`;
        if (messageId) {
            link += `/${messageId}`;
        }
    }
    return link;
}

async function cacheNeededGuildsMessages(client) {
    await cacheRoleReactMessage(client);
}

async function cacheRoleReactMessage(client) {
    client.log({
        textContent: 'Caching message for role reaction ...',
        headers: ['Ready', 'Cache', 'RoleReact'],
        type: 'log',
    });
    const rolesReactionsMessages = client.roleReactCollection;
    const query = {};
    const projection = { _id: 0, messageId:1, channelId: 1, guildId: 1 };
    const guildsRolesReactions = await rolesReactionsMessages.find(query).project(projection);
    for await (const guildRoleReactions of guildsRolesReactions) {
        const messageId = guildRoleReactions.messageId;
        const channelId = guildRoleReactions.channelId;
        const guildId = guildRoleReactions.guildId;
        try {
            const channel = await client.channels.fetch(channelId);
            try {
                const message = await channel.messages.fetch(messageId);
                client.log({
                    textContent: formatLog('Role reaction\'s message fetched', {
                        'MessageId': messageId,
                        'GuildId': guildId,
                    }),
                    headers: ['Ready', 'Cache', 'RoleReact'],
                    type: 'success',
                    url: message.url,
                });
            } catch (e) {
                // TODO : If the error code says that the message does not exist, delete the role react
                client.log({
                    textContent: formatLog('Cant fetch the message for the wanted role reaction', {
                        'MessageId': messageId,
                        'GuildId': guildId,
                    }),
                    headers: ['Ready', 'Cache', 'RoleReact'],
                    type: 'error',
                    url: getUrl(guildId, channelId, messageId),
                });
            }
        } catch (e) {
            // TODO : If the error code says that the channel does not exist, delete all the role react of the channel
            client.log({
                textContent: formatLog('Cant fetch the channel for the wanted role reaction', {
                    'ChannelId': channelId,
                    'GuildId': guildId,
                }),
                headers: ['Ready', 'Cache', 'RoleReact'],
                type: 'error',
                url: getUrl(guildId, channelId, messageId),
            });
        }
    }
    client.log({
        textContent: '... All message cached for role reaction',
        headers: ['Ready', 'Cache', 'RoleReact'],
        type: 'success',
    });
}

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        await client.logger.setLogChannelId(client.config.log.globalLogChannelId);
        client.logger.emit('ready');

        const log = client.log;

        log({
            textContent: 'Bot logged, ready triggered ...',
            headers: 'Ready',
            type: 'event',
        });
        await checkNewGuild(client);

        log({
            textContent: 'Adding Logger to each guild ...',
            headers: ['Ready', 'Logger'],
            type: 'event',
        });
        // Initialise the guild loggers
        await client.createLoggers();
        log({
            textContent: '... Loggers added',
            headers: ['Ready', 'Logger'],
            type: 'success',
        });

        // cache all guild and message where we look for a reaction
        log({
            textContent: 'Caching message event ...',
            headers: ['Ready', 'Cache'],
            type: 'log',
        });
        await cacheNeededGuildsMessages(client);
        log({
            textContent: '... Messages caching finished',
            headers: ['Ready', 'Cache'],
            type: 'success',
        });
        await client.loadTasksFromDB();
        client.api = new Api(client);
        client.api.start();
        client.auth = new Auth(client); // Auth class creation MUST be after Api class creation
        log({
            textContent: '... Bot fully start now\n',
            headers: 'Ready',
            type: 'Success',
        });
        await require('../../utility/deployCommands')(client);
    },
};