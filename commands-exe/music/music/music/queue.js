module.exports = async (interaction) => {

    const queue = interaction.client.player.getQueue(interaction.guildId);

    const page = interaction.options.getInteger('page', false) || 1;

    const queueList = queue.getQueue();

    if (queueList.length === 0) return interaction.reply({ content: 'No track in queue', ephemeral: true });

    if ((page - 1) * 10 > queueList.length) return interaction.reply({ content: 'Page not found', ephemeral: true });

    let message = '';

    for (let i = (page - 1) * 10; i < (page * 10 > queueList.length ? queueList.length : page * 10); i++) {
        if (queueList[i]) {
            message += `${i + 1}. **${queueList[i].type}** -  ${queueList[i].title} - **${queueList[i].channelTitle}**\n`;
        }
    }

    if (queueList.length > 10) message += `Page ${page}/${Math.ceil(queueList.length / 10)}`;

    await interaction.reply({ content: message.length < 1 ? 'queue is Empty' : message, ephemeral: message.length < 1 });
};