const { EmbedBuilder } = require('discord.js');
const { formatLog } = require('../../utility/Log');

module.exports = async function(interaction) {
    // ping is the response time to do : client to bot - bot to client
    // Default basic message for all guild language to avoid useless time lost when calculating the ping.
    interaction.reply('pinging ...');
    const reply = await interaction.fetchReply();
    const embed = new EmbedBuilder(interaction.client.embedTemplate)
        .setTitle(await interaction.translate('core/ping:TITLE'))
        .setDescription(await interaction.translate('core/ping:EMBED_DESCRIPTION', { ping: String(reply.createdAt - interaction.createdAt) }));
    await interaction.editReply({
        content: await interaction.translate('core/ping:REPLY_CONTENT'),
        embeds: [embed],
    });
    interaction.log({
        textContent: formatLog('', { 'Response Time': (reply.createdAt - interaction.createdAt) + 'ms' }),
        author: interaction.user,
        headers: 'Ping',
        type: 'log',
        url: reply.url,
    });
};