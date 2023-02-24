const { EmbedBuilder } = require('discord.js');
const { checkUserChannel } = require('../../../utility/Function');
module.exports = async (interaction) => {

    const check = await checkUserChannel(interaction);

    if (!check) return;

    const queue = interaction.client.player.getQueue(interaction.guildId);

    if (!queue || !queue.playing) return interaction.reply({ content: interaction.translate('music/music/error:no_track'), ephemeral: true });

    const page = interaction.options.getInteger('page', false) || 1;

    const queueList = queue.getQueue();

    const actualTrack = queue.actualTrack;

    if (!actualTrack) return interaction.reply({ content: interaction.translate('music/music/error:no_track_in_queue'), ephemeral: true });

    if (actualTrack) {
        const nomplaying = new EmbedBuilder()
            .setTitle(await interaction.client.translate('music/music/queue:exe:now_playing', {}, interaction.guild.preferredLocale))
            .setThumbnail(actualTrack.thumbnail)
            .setDescription(`**${actualTrack.type}** - ${actualTrack.title} - **${actualTrack.channelTitle}**`)
            .setTimestamp(new Date());

        await interaction.reply({ embeds: [nomplaying] });
    }

    if (queueList.length === 0) return;

    if ((page - 1) * 10 > queueList.length - 1) return interaction.reply({ content: interaction.translate('music/music/error:404_page'), ephemeral: true });

    let message = '';

    for (let i = (page - 1) * 10; i < (page * 10 > queueList.length ? queueList.length : page * 10); i++) {
        if (queueList[i]) {
            message += `${i + 1}. **${queueList[i].type}** -  ${queueList[i].title} - **${queueList[i].channelTitle}**\n`;
        }
    }

    if (queueList.length > 10) message += `Page ${page}/${Math.ceil(queueList.length / 10)}`;

    await interaction.followUp({ content: message.length < 1 ? interaction.translate('music/music/error:queue_empty') : message, ephemeral: message.length < 1 });
};