const { EmbedBuilder } = require('discord.js');
const { checkUserChannel } = require('../../../../../utility/Function');

// TODO verify for youtube playlist
module.exports = async (interaction) => {

    const check = await checkUserChannel(interaction);

    if (!check) return;

    await interaction.reply({ content: await interaction.translate('music/music:exe:play:recherche'), ephemeral: true });

    const id = interaction.options.getString('query', true);

    const queue = interaction.client.player.getQueue(interaction.guildId);

    const channel = interaction.member.voice.channel;

    if (!channel) return interaction.reply({ content: await interaction.translate('music/music:exe:error:user_not_in_voice'), ephemeral: true });

    queue.connect(channel);

    const track = await interaction.client.player.searchYoutubeTrack(id);

    if (!track) return interaction.reply({ content: await interaction.translate('music/music:exe:error:404_result'), ephemeral: true });

    const embed = new EmbedBuilder()
        .setTitle('Youtube')
        .setImage(track.thumbnail)
        .setDescription(await interaction.translate('music/music:exe:play:add_track_to_queue', { title: track.title }) + ` by [${track.channelTitle}](${track.url} "The best youtuber ever")`);

    const result = await interaction.followUp({ embeds: [embed] });

    track.discordMessageUrl = result.url;

    queue.addTrack(track);

    if (!queue.playing) {
        queue.play();
    }
};