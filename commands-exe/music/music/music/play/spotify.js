const { isUrl } = require('../../../../../utility/Function');

module.exports = async (interaction) => {

    const client = interaction.client;

    const queue = client.player.getQueue(interaction.guildId);

    let query = interaction.options.getString('query', true);

    const member = interaction.member;

    const voiceChannel = member.voice.channel;

    await interaction.reply({ content: await interaction.translate('music/music:exe:play:recherche'), ephemeral: true });

    if (isUrl(query)) {

        const url = new URL(query);

        if (url.protocol.includes('spotify')) {
            query = url.pathname.split(':');

            const data = await client.player.spotifyClient.getById(query[1], query[0]);

            switch (data.type) {
            case 'track':
                if (data.name) {
                    const ytTrack = await client.player.searchYoutubeTrack(`${data.name} ${data.artists[0].name}`);
                    if (ytTrack) {
                        ytTrack.type = 'spotify';
                        queue.addTrack(ytTrack);
                        await interaction.followUp({ content: await interaction.translate('music/music:exe:play:add_track_to_queue', { title: ytTrack?.title }), ephemeral: false });
                    } else {
                        return interaction.followUp({ content: await interaction.translate('music/music:exe:error:404_result'), ephemeral: true });
                    }
                }
                break;
            case 'album':
            case 'playlist':
                if (data.tracks) {
                    const listTrack = [];
                    await interaction.editReply({ content: await interaction.translate('music/music:exe:play:loading') });
                    for (const track of data.tracks.items) {
                        if (track?.name) {
                            const ytTrack = await client.player.searchYoutubeTrack(`${track.name} ${track.artists[0].name}`);
                            if (ytTrack) {
                                ytTrack.type = 'spotify';
                                listTrack.push(ytTrack);
                            }
                        }
                    }
                    queue.addTracks(listTrack);
                    await interaction.followUp({ content: await interaction.translate('music/music:exe:play:add_tracks_to_queue', { title: data.name, nb: listTrack.length }), ephemeral: false });
                }
                break;
            }
        }
    } else {
        const type = ['track'];

        const data = await client.player.spotifyClient.search(query, type, 1);

        if (data.tracks?.items) {
            const track = data.tracks.items[0];
            if (!track?.name) return interaction.followUp({ content: await interaction.translate('music/music:exe:error:404_result'), ephemeral: true });
            const ytTrack = await client.player.searchYoutubeTrack(`${track.name} ${track.artists[0].name}`);
            if (!ytTrack) return interaction.followUp({ content: await interaction.translate('music/music:exe:error:404_result'), ephemeral: true });
            ytTrack.type = 'spotify';
            queue.addTrack(ytTrack);
            await interaction.followUp({ content: await interaction.translate('music/music:exe:play:add_track_to_queue', { title: ytTrack.title }), ephemeral: false });
        }
    }

    queue.connect(voiceChannel);

    if (!queue.playing) {
        setTimeout(() => {
            queue.play();
        }, 1000);
    }
};