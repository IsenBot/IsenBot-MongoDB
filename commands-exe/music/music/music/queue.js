const { EmbedBuilder } = require('discord.js');
module.exports = async (interaction) => {

    const queue = interaction.client.player.getQueue(interaction.guildId);

    const page = interaction.options.getInteger('page', false) || 1;

    const queueList = queue.getQueue();

    if (queueList.length === 0) return interaction.reply({ content: await interaction.translate('music:music/exe:error:no_track_in_queue'), ephemeral: true });

    const actualTrack = queue.actualTrack;

    if (actualTrack) {
        const nomplaying = new EmbedBuilder()
            .setTitle(await interaction.translate('music:music/exe:now_playing'))
            .setThumbnail(actualTrack.thumbnail)
            .setDescription(`**${actualTrack.type}** - ${actualTrack.title} - **${actualTrack.channelTitle}**`)
            .setTimestamp(new Date());

        await interaction.reply({ embeds: [nomplaying] });
    }

    if ((page - 1) * 10 > queueList.length - 1) return interaction.reply({ content: await interaction.translate('music/music:exe:error:404_page'), ephemeral: true });

    let message = '';

    for (let i = (page - 1) * 10; i < (page * 10 > queueList.length ? (queueList.length - 1) : page * 10); i++) {
        if (queueList[i]) {
            message += `${i + 1}. **${queueList[i].type}** -  ${queueList[i].title} - **${queueList[i].channelTitle}**\n`;
        }
    }

    if (queueList.length > 10) message += `Page ${page}/${Math.ceil(queueList.length / 10)}`;

    await interaction.followUp({ content: message.length < 1 ? await interaction.translate('music/music:exe:error:queue_empty') : message, ephemeral: message.length < 1 });
};