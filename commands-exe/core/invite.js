const { EmbedBuilder } = require('discord.js');
const { formatLog } = require('../../utility/Log');

module.exports = async function(interaction) {
    const channelId = interaction.options.getChannel('core/invite:BUILDER:NAME') || interaction.channelId;
    const channel = interaction.guild.available ? await interaction.guild.channels.fetch(channelId) : undefined;
    const invite = channel.isTextBased() ? await channel.createInvite() : undefined;
    const embed = new EmbedBuilder(interaction.client.embedTemplate)
        .setTitle(await interaction.translate('core/invite:TITLE', { channel: 'test' }))
        .setDescription(invite.url);
    await interaction.reply({
        embeds: [embed],
    });
    interaction.log({
        textContent: formatLog('', { 'Invitation link': invite.url }),
        author: interaction.user,
        headers: 'Invite',
        type: 'log',
    });
};