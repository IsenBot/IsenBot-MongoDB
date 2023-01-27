module.exports = async (interaction) => {

    const queue = interaction.client.player.getQueue(interaction.guildId);

    queue.skip();

    await interaction.reply({ content: await interaction.translate('music/music:exe:skip') });
};