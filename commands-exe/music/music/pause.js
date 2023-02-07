const { checkUserChannel } = require('../../../utility/Function');
module.exports = async (interaction) => {

    const check = await checkUserChannel(interaction);

    if (!check) return;

    const queue = interaction.client.player.getQueue(interaction.guildId);

    const mode = interaction.options.getString('mode', true);

    switch (mode) {
    case 'pause':
        queue.pause();
        await interaction.reply({ content: await interaction.translate('music/music/pause:exe:pause') });
        break;
    case 'resume':
        queue.resume();
        await interaction.reply({ content: await interaction.translate('music/music/pause:exe:resume') });
        break;
    default:
        return interaction.reply({ content: await interaction.translate('music/music/error:mode_invalid') });
    }
};