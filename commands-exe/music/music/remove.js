const { checkUserChannel } = require('../../../utility/Function');
module.exports = async (interaction) => {

    const check = await checkUserChannel(interaction);

    if (!check) return;

    const queue = interaction.client.player.getQueue(interaction.guildId);

    if (!queue || !queue.playing) return interaction.reply({ content: interaction.translate('music/music/error:no_track'), ephemeral: true });

    const nb = interaction.options.getNumber('index', true) - 1;

    if (nb > queue.queue.length) return interaction.reply({ content: interaction.translate('music/music/error:index_out_of_range'), ephemeral: true });

    if (nb < 0) return interaction.reply({ content: interaction.translate('music/music/error:index_out_of_range'), ephemeral: true });

    const track = queue.remove(nb);

    await interaction.reply({ content: interaction.client.translate('music/music/remove:exe:remove', { track: track.title }, interaction.guild.preferredLocale) });
};