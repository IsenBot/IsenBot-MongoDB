const { EmbedBuilder } = require('discord.js');
const { formatLog } = require('../../utility/Log');

const pingGifs = [
    'https://tenor.com/view/snoopy-table-tennis-ping-pong-gif-10337529',
    'https://tenor.com/view/ping-pong-gif-26358812',
    'https://tenor.com/view/pong-gif-26462133',
    'https://tenor.com/view/hasbulla-ping-pong-gif-22877539',
    'https://tenor.com/view/jesse-and-wess-ping-pong-gif-12990692',
    'https://tenor.com/view/pingpong-tabletennis-gif-7251388',
    'https://tenor.com/view/drake-and-josh-table-tennis-funny-gif-12695759',
    'https://tenor.com/view/pingpong-robot-gif-3566230',
    'https://tenor.com/view/antoine-trex-iut-calais-trex-antoine-gif-15079318',
    'https://tenor.com/view/ping-slap-dog-doggo-punch-gif-17672413',
    'https://tenor.com/view/cats-ping-pong-gif-8942945',
    'https://tenor.com/view/computer-reaction-approval-internet-surfing-gif-12923140',
    'https://tenor.com/view/internet-simpsons-gif-11288919',
    'https://tenor.com/view/programmer-programming-computer-typing-gif-7603564',
    'https://tenor.com/view/jump-cat-infinity-cat-gif-18771324',
    'https://tenor.com/view/kitten-keybo-lap-gif-19489640',
    'https://tenor.com/view/laptop-gif-26065234',
    'https://tenor.com/view/cat-gif-26024704',
    'https://tenor.com/view/hffgf-gif-22453222',
    'https://tenor.com/view/hacker-typing-hacking-computer-codes-gif-17417874',
    'https://tenor.com/view/cat-computer-typing-fast-gif-5368357',
    'https://tenor.com/view/hacker-gif-19246062',
    'https://tenor.com/view/techie-stereotypes-guy-relate-nerd-gif-7767110',
    'https://tenor.com/view/all-systems-operational-discord-down-discord-discord-status-server-gif-22808376',
    'https://tenor.com/view/server-runing-server-up-and-running-hamster-gif-17522250',
    'https://tenor.com/view/server-up-server-is-up-bateman-american-psycho-patrick-bateman-gif-25604807',
    'https://tenor.com/view/lag-gaming-door-gif-17974671',
    'https://tenor.com/view/deepwoken-deepwoken-ping-deepwoken-servers-deepwoken-lag-gif-24749832',
    'https://tenor.com/view/cat-what-que-recalculando-loading-gif-19097337',
    'https://tenor.com/view/zootopia-sloth-oh-right-lag-loading-gif-5016247',
    'https://tenor.com/view/ping-gif-25999677',
    'https://tenor.com/view/did-you-just-ping-me-gif-22421669',
    'https://tenor.com/view/cute-cat-gif-22744233',
    'https://tenor.com/view/lag-gaming-ping-gif-15955613',
    'https://tenor.com/view/ping-meme-cat-gif-17998801',
    'https://tenor.com/view/the-it-crowd-richard-ayoade-maurice-moss-slow-internet-pissed-gif-5569385',
    'https://tenor.com/view/bot-discord-online-gif-20085959',
    'https://tenor.com/view/robot-bot-i-am-robot-humanoid-servant-gif-7921953',
];

module.exports = async function(interaction) {
    // ping is the response time to do : client to bot - bot to client
    // Default basic message for all guild language to avoid useless time lost when calculating the ping.
    interaction.reply('pinging ...');
    let mongoUp = true;
    let botUp = true;
    const showGif = true;
    const reply = await interaction.fetchReply().catch(() => {botUp = false;});
    const mongoPing = await interaction.client.pingDB().catch(() => {mongoUp = false;});
    console.log(mongoPing);
    const embed = new EmbedBuilder(interaction.client.embedTemplate)
        .setTitle(interaction.translate('core/ping:TITLE'))
        .addFields(
            { name: interaction.translate('core/ping:BOT_PING', { ping: botUp ? String(reply.createdAt - interaction.createdAt) : '0', bot: interaction.client.user.username }), value: interaction.translate(`core/ping:${botUp ? 'UP' : 'DOWN'}`) },
            { name: interaction.translate('core/ping:MONGO_PING', { ping: mongoUp ? String(mongoPing) : '0' }), value: interaction.translate(`core/ping:${mongoUp ? 'UP' : 'DOWN'}`) },
        );
    const gif = pingGifs[Math.floor(Math.random() * pingGifs.length)];
    await interaction.editReply({
        content: '',
        embeds: [embed],
    });
    if (showGif) {
        await interaction.followUp({
            content: gif,
        });
    }
    interaction.log({
        textContent: formatLog('', { 'Response Time': (reply.createdAt - interaction.createdAt) + 'ms' }),
        author: interaction.user,
        headers: 'Ping',
        type: 'log',
        url: reply.url,
    });
};