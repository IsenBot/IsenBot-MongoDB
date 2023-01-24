const { EmbedBuilder } = require('discord.js');
module.exports = async (interaction) => {

    await interaction.reply({ content: 'Recherche for ...!', ephemeral: true });

    const queue = interaction.client.player.getQueue(interaction.guildId);

    if (!queue) return interaction.reply({ content: 'Error with the queue i\'m sorry', ephemeral: true });

    await interaction.client.player.searchYoutubeTrackById('rOnIpoJ1Ygw');

    const channel = interaction.member.voice.channel;

    if (!channel) return interaction.reply({ content: 'You need to be in a voice channel to use this command', ephemeral: true });

    queue.connect(channel);

    const track = await interaction.client.player.searchYoutubeTrack('rOnIpoJ1Ygw');

    const embed = new EmbedBuilder()
        .setTitle('Youtube')
        .setImage(track.thumbnail)
        .setDescription(`Add to queue \`${track.title}\` by [${track.channelTitle}](${track.url} "The best youtuber ever")`);

    const result = await interaction.followUp({ embeds: [embed] });

    track.discordMessageUrl = result.url;

    queue.addTrack(track);

    if (!queue.playing) {
        queue.play();
    }
};