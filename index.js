// Require the necessary discord.js classes
const { GatewayIntentBits, BaseInteraction } = require('discord.js');
const IsenBot = require('./core/IsenBot');

Object.defineProperties(BaseInteraction.prototype, {
    logger: {
        get: function() {
            return this.guild.logger;
        },
    },
    fetchGuildLanguage: {
        value: async function() {
            if (!Object.hasOwn(this, 'languageName')) {
                try {
                    await this.client.mongodb.connect();
                    const query = { _id: this.guildId };
                    const options = { projection: { _id: 1, language: 1 } };
                    return this.languageName = (await this.client.guildsCollection.findOne(query, options)).language;
                } finally {
                    await this.client.mongodb.close();
                }
            }
            return this.languageName;
        },
    },
    translate: {
        value: async function(messageComponentPath, args = {}) {
            return await this.client.translate(messageComponentPath, args, await this.fetchGuildLanguage());
        },
    },
    log: {
        value: function(...param) {
            return this.logger?.log(...param);
        },
    },
});

const { SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder, SlashCommandChannelOption, SlashCommandMentionableOption, SlashCommandIntegerOption, SlashCommandNumberOption, SlashCommandRoleOption, SlashCommandStringOption, SlashCommandUserOption, SlashCommandBooleanOption } = require('discord.js');
const SlashCommandList = [SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder, SlashCommandChannelOption, SlashCommandMentionableOption, SlashCommandIntegerOption, SlashCommandNumberOption, SlashCommandRoleOption, SlashCommandStringOption, SlashCommandUserOption, SlashCommandBooleanOption];
for (const SlashCommand of SlashCommandList) {
    Object.defineProperties(SlashCommand.prototype, {
        setNamePath: {
            value: function(name) {
                this.name = name;
                return this;
            },
        },
    });
}

async function main() {
    const startLogo =
        '    ..  ...  .  -.   -...  ---  -    \n\n' +
        '██╗███████╗███████╗███╗   ██╗         \n' +
        '██║██╔════╝██╔════╝████╗  ██║         \n' +
        '██║███████╗█████╗  ██╔██╗ ██║         \n' +
        '██║╚════██║██╔══╝  ██║╚██╗██║         \n' +
        '██║███████║███████╗██║ ╚████║         \n' +
        '╚═╝╚══════╝╚══════╝╚═╝  ╚═══╝         \n' +
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
    // Some logs
    client.log({ textContent: startLogo, isEmbed: false });
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