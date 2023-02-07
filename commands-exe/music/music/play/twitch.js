const { EmbedBuilder } = require('discord.js');
const { checkUserChannel } = require('../../../../utility/Function');

module.exports = async (interaction) => {

    const check = await checkUserChannel(interaction);

    if (!check) return;

    const username = interaction.options.getString('query', true);

    const queue = interaction.client.player.getQueue(interaction.guildId);

    await interaction.reply({ content: await interaction.translate('music/music/play:exe:recherche'), ephemeral: true });

    const track = await interaction.client.player.searchTwitchStreamTrack(username);

    if (track.error) {
        return interaction.followUp({ content: track.error, ephemeral: true });
    }

    const embed = new EmbedBuilder()
        .setTitle('Twitch Stream')
        .setThumbnail(track.thumbnail)
        .setDescription(await interaction.translate('music/music/play:exe:add_track_to_queue', { title: track.title }) + ` by [${track.channelTitle}](${track.channelTitle === 'etoiles' ? track.url + ' "The best streamer ever"' : track.url + ' "an other good streamer"'})`);

    const result = await interaction.followUp({ embeds: [embed] });

    track.discordMessageUrl = result.url;

    queue.addTrack(track);

    queue.connect(interaction.member.voice.channel);

    if (!queue.playing) {
        queue.play();
    }
};