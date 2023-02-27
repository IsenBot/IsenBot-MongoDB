const YouTube = require('youtube-sr').default;

module.exports = async (interaction) => {
    if (interaction.isAutocomplete()) {
        const query = interaction.options.getFocused();

        const client = interaction.client;

        const subcommand = interaction.options.getSubcommand();
        const subcommandGroup = interaction.options.getSubcommandGroup();

        if (subcommandGroup === 'play') {

            try {
                new URL(query);
                return await interaction.respond([]);
            } catch { /* empty */ }


            if (subcommand === 'youtube') {

                if (query.length < 3) return await interaction.respond([]);

                const fetch = await YouTube.search(query, { type: 'video', limit : 7 });

                if (!fetch?.length) return await interaction.respond([]);

                interaction.respond(fetch.map((track) => ({
                    name: track.channel.name + ' - ' + (track.title.length + track.channel.name.length > 90 ? track.title.slice(0, 90 - track.channel.name.length) + '...' : track.title),
                    value: track.id,
                })));

            } else if (subcommand === 'twitch') {
                if (query.length < 3) return await interaction.respond([]);

                const fetch = await client.player.twitchApi.fetchQuery(encodeURIComponent(query), (5));

                if (fetch?.data?.length < 1) return interaction.respond([]);

                interaction.respond(fetch?.data?.map((user) => ({
                    name: (`${user.broadcaster_language} - ${user.display_name} - ${user.title}`).length > 90 ? (`${user.broadcaster_language} - ${user.display_name} - ${user.title}`).slice(0, 90) + '...' : (`${user.broadcaster_language} - ${user.display_name} - ${user.title}`),
                    value: user.broadcaster_login,
                })));
            } else if (subcommand === 'spotify') {

                if (query.length < 3) return await interaction.respond([]);

                const result = await client.player.spotifyClient.search(query, ['track', 'playlist', 'album'], 3);

                if (!result) return await interaction.respond([]);

                const data = [];

                Object.keys(result).map((key) => {
                    result[key].items.forEach((item) => {
                        if (item.type === 'track') {
                            data.push({
                                name: `${item.type.toUpperCase()} 🎧 - ${item.artists[0].name} - ${item.name}`,
                                uri: item.uri,
                            });
                        } else if (item.type === 'playlist' && item.tracks.total > 0) {
                            data.push({
                                name: `${item.type.toUpperCase()} 🎶 - ${item.name} - ${item.owner.display_name}`,
                                uri: item.uri,
                            });
                        } else if (item.type === 'album' && item.total_tracks > 0) {
                            data.push({
                                name: `${item.type.toUpperCase()} 💿 - ${item.artists[0].name} - ${item.name}`,
                                uri: item.uri,
                            });
                        }
                    });
                });

                if (!data.length) return await interaction.respond([]);

                if (!interaction) return;

                try {
                    await interaction.respond(data.map((item) => ({
                        name: item.name,
                        value: item.uri,
                    })));
                } catch (e) {
                    // Do nothing
                }

            }
        }
    }
};