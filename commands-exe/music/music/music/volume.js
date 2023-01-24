module.exports = async (interaction) => {

    const queue = interaction.client.player.getQueue(interaction.guildId);

    const volume = interaction.options.getInteger('volume', true);

    if (volume > 100) {
        return interaction.reply({
            content: 'Volume must be less than 100',
            ephemeral: true,
        });
    }

    if (volume < 0) {
        return interaction.reply({
            content: 'Volume must be greater than 0',
            ephemeral: true,
        });
    }

    queue.setVolume(volume);

    await interaction.reply({ content: `Volume set to ${volume}` });
};