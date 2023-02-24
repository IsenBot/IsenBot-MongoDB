const { checkUserChannel } = require('../../../utility/Function');
module.exports = async (interaction) => {

    const check = await checkUserChannel(interaction);

    if (!check) return;

    const queue = interaction.client.player.getQueue(interaction.guildId);

    if (!queue || !queue.playing) return interaction.reply({ content: interaction.translate('music/music/error:no_track'), ephemeral: true });

    const mode = interaction.options.getString('mode', true);

    switch (mode) {
    case 'pause':
        queue.pause();
        await interaction.reply({ content: interaction.client.translate('music/music/pause:exe:pause', {}, interaction.guild.preferredLocale) });
        break;
    case 'resume':
        queue.resume();
        await interaction.reply({ content: interaction.client.translate('music/music/pause:exe:resume', {}, interaction.guild.preferredLocale) });
        break;
    default:
        return interaction.reply({ content: interaction.translate('music/music/error:mode_invalid'), ephemeral: true });
    }
};