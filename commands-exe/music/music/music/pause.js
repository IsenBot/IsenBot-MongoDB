module.exports = async (interaction) => {

    const queue = interaction.client.player.getQueue(interaction.guildId);

    const mode = interaction.options.getString('mode', true);

    switch (mode) {
    case 'pause':
        queue.pause();
        await interaction.reply({ content: 'Paused the song' });
        break;
    case 'resume':
        queue.resume();
        await interaction.reply({ content: 'Resumed the song' });
        break;
    default:
        await interaction.reply({ content: 'Invalid mode' });
    }
};