module.exports = async (interaction) => {

    const queue = interaction.client.player.getQueue(interaction.guildId);

    const volume = interaction.options.getInteger(await interaction.translate('music/music:builder:volume:name'), true);

    if (volume > 100) {
        return interaction.reply({
            content: await interaction.translate('music/music:exe:error:volume', { minVol: 0, maxVol: 100 }),
            ephemeral: true,
        });
    }

    if (volume < 0) {
        return interaction.reply({
            content: await interaction.translate('music/music:exe:error:volume', { minVol: 0, maxVol: 100 }),
            ephemeral: true,
        });
    }

    queue.setVolume(volume);

    await interaction.reply({ content: await interaction.translate('music/music:exe:volume', { volume: volume }) });
};