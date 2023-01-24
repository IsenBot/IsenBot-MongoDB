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
        value: async function(messageComponentPath, args = {}) {
            return await this.client.translate(messageComponentPath, args, this.locale);
        },
    },
    getLocales: {
        value: async function(messageComponentPath) {
            return await this.client.getLocales(messageComponentPath);
        },
    },
    log: {
        value: function(...param) {
            return this.logger?.log(...param);
        },
    },
    mongodb: {
        get: async function() {
            return await this.client.guildDB(this.guildId);
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

    exports.client = client;

    // Some logs
    client.log({
        textContent: startLogo,
        isEmbed: false,
        isCodeBlock: true,
    });
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

//test 1

main();