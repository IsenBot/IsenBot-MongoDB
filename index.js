// Require the necessary discord.js classes
const { GatewayIntentBits } = require('discord.js');
const IsenBot = require('./core/IsenBot');
const fs = require("fs");

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
    const client = await IsenBot.create({ intents: [GatewayIntentBits.Guilds] });
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