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
    await client.logger.log({ textContent: startLogo, isEmbed: false });
    await client.logger.log({
        textContent: 'The bot is starting ...',
        headers: 'CommandLoader',
        type: 'event',
    });
    // Load the command in the client instance, so we can execute them when someone use them
    await client.loadCommand();

    initializeEventHandler(client);

    // When the client is ready, run this code (only once)
    client.once('ready', () => {
        client.createLoggers();
        console.log('... Ready!');
    });
    // Login to Discord with your client's token
    console.log('Login ...');
    await client.login(client.config.token);
}

function initializeEventHandler(client) {
    fs.readdirSync('./event/').forEach(dirs => {
        const eventFiles = fs.readdirSync(`./event/${dirs}`).filter(file => file.endsWith('.js'));
        const handler = (dirs === 'core' ? client : dirs === 'music' ? client.player : undefined )
        for (const file of eventFiles) {
            const event = require(`./event/${dirs}/${file}`);
            if (event.once) {
                handler?.once(event.name, (...args) => event.execute(...args));
            } else {
                handler?.on(event.name, (...args) => event.execute(...args));
            }
        }
    });
}

main();