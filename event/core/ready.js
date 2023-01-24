const { formatLog } = require('../../utility/Log');
const { GuildSchema } = require('../../utility/Schema');

async function startDB(client) {
    client.log({
        textContent: 'Starting Database connection ...',
        headers: ['Ready', 'MongoDB'],
        type: 'log',
    });
    try {
        await client.startDB();
        await client.mongodb.db(client.config.database.databaseName).command({ ping: 1 });
    } catch (e) {
        client.log({
            textContent: 'Database start error ...',
            headers: ['Ready', 'MongoDB'],
            type: 'error',
        });
        console.error(e);
    }

    client.guilds.fetch().then(guilds => guilds.forEach(guild => {
        client.player.createQueue(guild.id);
    }));
}

async function checkNewGuild(client) {
    // try {
    const guildsCollection = client.guildsCollection;
    const query = {};
    const projection = { id_ : 1 };

    const guildsId = await guildsCollection.find(query).project(projection).map(p => p._id).toArray();

    let change = false;

    for (const guild of client.guilds.cache.map(guildCache => guildCache)) {
        if (!guildsId.includes(guild.id)) {
            change = true;
            client.log({
                textContent: formatLog('New guild detected', { 'Id': guild.id, 'Name': guild.name }),
                headers: 'Ready',
                type: 'log',
            });
            await guildsCollection.insertOne(new GuildSchema({ _id: String(guild.id) }));
        }
    }
    if (!change) {
        client.log({
            textContent: 'No new guild detected',
            headers: 'Ready',
            type: 'log',
        });
    }

    /* } finally {
       await client.mongodb.close();
    }*/
}
/*
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


// TODO : replace in the guild db rather than in a global db
 async function cacheRoleReactMessage(client) {
    client.log({
        textContent: 'Caching message for role reaction ...',
        headers: ['Ready', 'Cache', 'RoleReact'],
        type: 'log',
    });
    try {
        const database = client.guildsCollection;

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
                    client.log({
                        textContent: formatLog('Role reaction\'s message fetched', { 'MessageId' : messageId, 'GuildId' : guildId }),
                        headers: ['Ready', 'Cache', 'RoleReact'],
                        type: 'success',
                        url: message.url,
                    });
                } catch (e) {
                    // TODO : If the error code says that the message does not exist, delete the role react
                    client.log({
                        textContent: formatLog('Cant fetch the message for the wanted role reaction', { 'MessageId' : messageId, 'GuildId' : guildId }),
                        headers: ['Ready', 'Cache', 'RoleReact'],
                        type: 'error',
                        url: getUrl(guildId, channelId, messageId),
                    });
                }
            } catch (e) {
                // TODO : If the error code says that the channel does not exist, delete all the role react of the channel
                client.log({
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
    client.log({
        textContent: '... All message cached for role reaction',
        headers: ['Ready', 'Cache', 'RoleReact'],
        type: 'success',
    });
}
*/
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

        await startDB(client);

        log({
            textContent: 'Database connected successfully ...',
            headers: ['Ready', 'MongoDB'],
            type: 'success',
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
        /*
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
        */
        log({
            textContent: '... Bot fully start now\n',
            headers: 'Ready',
            type: 'Success',
        });
        await require('../../utility/deployCommands')(client);
    },
};