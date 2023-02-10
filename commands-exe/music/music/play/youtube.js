const { EmbedBuilder } = require('discord.js');
const { checkUserChannel, isUrl } = require('../../../../utility/Function');

module.exports = async (interaction) => {

    const check = await checkUserChannel(interaction);

    if (!check) return;

    await interaction.reply({ content: await interaction.translate('music/music/play:exe:recherche'), ephemeral: true });

    const id = interaction.options.getString('query', true);

    const queue = interaction.client.player.getQueue(interaction.guildId);

    let track = null;

    if (isUrl(id)) {
        const url = new URL(id);

        const youtubeRegex = /^(https?:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/;
        if (youtubeRegex.test(url)) {

            if (url.pathname === '/playlist') {
                const playlistId = url.searchParams.get('list');
                track = await interaction.client.player.searchYoutubePlaylist(playlistId);
            } else if (url.pathname === '/watch') {
                track = [await interaction.client.player.searchYoutubeId(id)];
            } else {
                return interaction.editReply({ content: await interaction.translate('music/music/error:invalid_url'), ephemeral: true });
            }
        } else {
            return interaction.editReply({ content: await interaction.translate('music/music/error:404_result'), ephemeral: true });
        }
    } else {
        track = [await interaction.client.player.searchYoutubeId(id)];
    }

    if (!track || !track[0]) return interaction.editReply({ content: await interaction.translate('music/music/error:404_result'), ephemeral: true });

    const embed = new EmbedBuilder()
        .setTitle('Youtube')
        .setThumbnail(track[0].thumbnail);

    if (track.length > 1) {
        embed.setDescription(await interaction.translate('music/music/play:exe:add_tracks_to_queue', { title: track[0].title, nb: track.length }));
    } else {
        embed.setDescription(await interaction.translate('music/music/play:exe:add_track_to_queue', { title: track[0].title }));
    }

    const result = await interaction.followUp({ embeds: [embed] });

    track.forEach((t) => {
        t.discordMessageUrl = result.url;
    });

    queue.addTracks(track);

    queue.connect(interaction.member.voice.channel);

    if (!queue.playing) {
        queue.play();
    }
};