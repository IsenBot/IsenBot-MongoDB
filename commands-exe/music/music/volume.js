const { checkUserChannel } = require('../../../utility/Function');
module.exports = async (interaction) => {

    const check = await checkUserChannel(interaction);

    if (!check) return;

    const queue = interaction.client.player.getQueue(interaction.guildId);

    if (!queue || !queue.playing) return interaction.reply({ content: interaction.translate('music/music/error:no_track'), ephemeral: true });

    const volume = interaction.options.getInteger('volume');

    if (volume === null) return interaction.reply({ content: interaction.translate('music/music/volume:exe:get_volume', { volume: queue.volume }), ephemeral: true });

    if (volume > 100) {
        return interaction.reply({
            content: interaction.translate('music/music/error:volume_out_of_range', { volMin: 0, volMax: 100 }),
            ephemeral: true,
        });
    }

    if (volume < 0) {
        return interaction.reply({
            content: interaction.translate('music/music/volume:volume_out_of_range', { volMin: 0, volMax: 100 }),
            ephemeral: true,
        });
    }

    queue.smoothVolume(volume);

    await interaction.reply({ content: interaction.client.translate('music/music/volume:exe:set_volume', { volume: volume }, interaction.guild.preferredLocale) });
};