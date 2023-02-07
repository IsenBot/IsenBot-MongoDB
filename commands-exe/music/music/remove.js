const { checkUserChannel } = require('../../../utility/Function');
module.exports = async (interaction) => {

    const check = await checkUserChannel(interaction);

    if (!check) return;

    const queue = interaction.client.player.getQueue(interaction.guildId);

    const nb = interaction.options.getNumber('number', true);

    if (!queue || !queue.playing) return interaction.reply({ content: await interaction.translate('music/music/error:no_track') });

    if (nb > queue.queue.length) return interaction.reply({ content: await interaction.translate('music/music/error:index_out_of_range') });

    if (nb < 1) return interaction.reply({ content: await interaction.translate('music/music/error:index_out_of_range') });

    const track = queue.remove(nb - 1);

    await interaction.reply({ content: await interaction.translate('music/music/remove:exe:remove', { track: track.title }) });
};