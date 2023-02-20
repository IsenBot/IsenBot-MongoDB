// Require the necessary discord.js classes
const { GatewayIntentBits, BaseInteraction } = require('discord.js');
const IsenBot = require('./core/IsenBot');

Object.defineProperties(BaseInteraction.prototype, {
    logger: {
        get: function() {
            return this.guild.logger;
        },
    },
    translate: {
        value: function(messageComponentPath, args = {}) {
            return this.client.translate(messageComponentPath, args, this.locale);
        },
    },
    getLocales: {
        value: function(messageComponentPath) {
            return this.client.getLocales(messageComponentPath);
        },
    },
    log: {
        value: function(...param) {
            return this.logger?.log(...param);
        },
    },
});

async function main() {
    const startLogo =
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
    console.log(startLogo);
    // Create a new client instance
    const client = await IsenBot.create({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildVoiceStates,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildMessageReactions,
        ],
    });
    async function gracefullyShutdown(signal) {
        client.log({
            textContent: `${signal} signal received. Shutting down ...`,
            type: 'event',
        });
        client.log({
            textContent: 'Closing database connection...',
            type: 'log',
        });
        await client.mongodb.close();
        client.log({
            textContent: 'Database Connection closed',
            type: 'log',
        });
        client.log({
            textContent: 'Destroying player ...',
            type: 'log',
        });
        await client.player.destroy();
        client.log({
            textContent: 'Player closed',
            type: 'log',
        });
        client.log({
            textContent: 'Destroying discord client...',
            type: 'log',
        });
        client.destroy();
        console.log('Discord client destroyed');
        console.log('Exit the process');
        process.exit();
    }
    process.on('SIGTERM', gracefullyShutdown);
    process.on('SIGINT', gracefullyShutdown);

    exports.client = client;
    // Some logs
    client.log({
        textContent: 'The bot is starting ...',
        type: 'log',
    });
    // Load the command in the client instance, so we can execute them when someone use them
    await client.loadCommand();
    // Load the events
    await client.loadEventHandler();
    // Login to Discord with your client's token
    client.log({
        textContent: 'Logging into discord ...',
        headers: '',
        type: 'log',
    });
    await client.login(client.config.token);
}

main();