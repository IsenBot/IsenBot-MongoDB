const { checkUserChannel } = require('../../../utility/Function');
module.exports = async (interaction) => {

    const check = await checkUserChannel(interaction);

    if (!check) return;

    const queue = interaction.client.player.getQueue(interaction.guildId);

    const volume = interaction.options.getInteger('volume');

    if (!volume) return interaction.reply({ content: await interaction.translate('music/music/volume:exe:get_volume', { volume: queue.getVolume() * 100 }), ephemeral: true });

    if (volume > 100) {
        return interaction.reply({
            content: await interaction.translate('music/music/error:volume_out_of_range', { volMin: 0, volMax: 100 }),
            ephemeral: true,
        });
    }

    if (volume < 0) {
        return interaction.reply({
            content: await interaction.translate('music/music/volume:volume_out_of_range', { volMin: 0, volMax: 100 }),
            ephemeral: true,
        });
    }

    queue.setVolume(volume);

    await interaction.reply({ content: await interaction.translate('music/music/volume:exe:set_volume', { volume: volume }) });
};