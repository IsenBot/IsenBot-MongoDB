const { checkUserChannel } = require('../../../../utility/Function');
module.exports = async (interaction) => {

    const check = await checkUserChannel(interaction);

    if (!check) return;

    const queue = interaction.client.player.getQueue(interaction.guildId);

    const mode = interaction.options.getString(await interaction.translate('MUSIC/MUSIC:BUILDER:MODE:NAME'), true);

    switch (mode) {
    case 'pause':
        queue.pause();
        await interaction.reply({ content: await interaction.translate('music/music:exe:pause') });
        break;
    case 'resume':
        queue.resume();
        await interaction.reply({ content: await interaction.translate('music/music:exe:resume') });
        break;
    default:
        return interaction.reply({ content: await interaction.translate('music/music:exe:error:mode_invalid') });
    }
};