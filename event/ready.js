const { formatLog } = require('../utility/Log');

async function checkNewGuild(client) {
    const mongodb = client.mongodb
    try {
        mongodb.connect();

        const database = mongodb.db('database_name');
        const guildsCollection = database.collection('guild');
        const query = {};
        const projection = { id_ : 1 };

        const guildsId = await guildsCollection.find(query).project(projection).map( p => p._id ).toArray();

        let change = false;

        for (const guild of client.guilds.cache.map( guild => guild )) {
            if (!guildsId.includes(guild)) {
                change = true;
                await client.log({
                    textContent: formatLog('New guild detected', { 'Id': guild.id, 'Name': guild.name }),
                    headers: 'Ready',
                    type: 'log',
                    url: guild.url
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
        mongodb.close();
    }
}

async function cacheNeededGuildsMessages(client) {
    // TODO : use database
    return;
}

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        const log = client.log;
        await log(`Triggered ...`, "[Ready]", "event");
        await log({
            textContent: 'Triggered ...',
            headers: 'Ready',
            type: 'event',
        });
        await checkNewGuild(client);

        //cache all guild and message where we look for a reaction
        await log({
            textContent: 'Caching message for reaction event ...',
            headers: ['Ready', 'Cache'],
            type: 'log',
        });
        await cacheNeededGuildsMessages(client);
        await log({
            textContent: 'Message caching finished',
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
            textContent: 'Loggers added',
            headers: ['Ready', 'Logger'],
            type: 'success',
        });
    },
};