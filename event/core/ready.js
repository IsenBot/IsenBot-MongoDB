const { formatLog } = require('../utility/Log');

async function checkNewGuild(client) {
    try {
        await client.mongodb.connect();

        const guildsCollection = client.guildsCollection;
        const query = {};
        const projection = { id_ : 1 };

        const guildsId = await guildsCollection.find(query).project(projection).map(p => p._id).toArray();

        let change = false;

        for (const guild of client.guilds.cache.map(guildCache => guildCache)) {
            if (!guildsId.includes(guild)) {
                change = true;
                await client.log({
                    textContent: formatLog('New guild detected', { 'Id': guild.id, 'Name': guild.name }),
                    headers: 'Ready',
                    type: 'log',
                });

                const guildData = {
                    _id: String(guild.id),
                };
                await guildsCollection.insertOne(guildData);
            }
        }
        if (!change) {
            await client.log({
                textContent: 'No new guild detected',
                headers: 'Ready',
                type: 'log',
            });
        }

    } finally {
        await client.mongodb.close();
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
    await client.log({
        textContent: 'Caching message for role reaction ...',
        headers: ['Ready', 'Cache', 'RoleReact'],
        type: 'log',
    });
    try {
        await client.mongodb.connect();

        const database = client.mongodb.db(client.config.database.databaseName);
        const rolesReactionsMessages = database.collection(client.config.database.rolesReactionsTableName);

        const query = {};
        const projection = { id_ : 1, channelId : 1, guildId : 1 };

        const guildsRolesReactions = await rolesReactionsMessages.find(query).project(projection);

        for await (const guildRoleReactions of guildsRolesReactions) {
            const messageId = guildRoleReactions._id;
            const channelId = guildRoleReactions.channelId;
            const guildId = guildRoleReactions.guildId;

            try {
                const channel = await client.channels.fetch(channelId);
                try {
                    const message = await channel.messages.fetch(messageId);
                    await client.log({
                        textContent: formatLog('Role reaction\'s message fetched', { 'MessageId' : messageId, 'GuildId' : guildId }),
                        headers: ['Ready', 'Cache', 'RoleReact'],
                        type: 'success',
                        url: message.url,
                    });
                } catch (e) {
                    // TODO : If the error code says that the message does not exist, delete the role react
                    await client.log({
                        textContent: formatLog('Cant fetch the message for the wanted role reaction', { 'MessageId' : messageId, 'GuildId' : guildId }),
                        headers: ['Ready', 'Cache', 'RoleReact'],
                        type: 'error',
                        url: getUrl(guildId, channelId, messageId),
                    });
                }
            } catch (e) {
                // TODO : If the error code says that the channel does not exist, delete all the role react of the channel
                await client.log({
                    textContent: formatLog('Cant fetch the channel for the wanted role reaction', { 'ChannelId' : channelId, 'GuildId' : guildId }),
                    headers: ['Ready', 'Cache', 'RoleReact'],
                    type: 'error',
                    url: getUrl(guildId, channelId, messageId),
                });
            }
        }
    } finally {
        await client.mongodb.close();
    }
    await client.log({
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
        await log('Triggered ...', '[Ready]', 'event');
        await log({
            textContent: 'Triggered ...',
            headers: 'Ready',
            type: 'event',
        });
        await checkNewGuild(client);

        // cache all guild and message where we look for a reaction
        await log({
            textContent: 'Caching message event ...',
            headers: ['Ready', 'Cache'],
            type: 'log',
        });
        await cacheNeededGuildsMessages(client);
        await log({
            textContent: '... Messages caching finished',
            headers: ['Ready', 'Cache'],
            type: 'success',
        });

        await log({
            textContent: 'Adding Logger to each guild ...',
            headers: ['Ready', 'Logger'],
            type: 'event',
        });
        // Initialise the guild loggers
        await client.createLoggers();
        await log({
            textContent: '... Loggers added',
            headers: ['Ready', 'Logger'],
            type: 'success',
        });
    },
};