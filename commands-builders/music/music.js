const path = require('node:path');
const { SlashCommandBuilder } = require('discord.js');
const { initLanguage } = require('../../utility/commandBuilder');
const YouTube = require('youtube-sr').default;

module.exports = {
    category: path.basename(__dirname),
    data: initLanguage(new SlashCommandBuilder()
        .setName('music')
        .setDescription('music commands')
        .addSubcommandGroup(g => {
            return g.setName('play')
                .setDescription('play music')
                .addSubcommand(s => {
                    return s.setName('youtube')
                        .setDescription('play music from youtube')
                        .addStringOption(o => {
                            return o.setName('query')
                                .setDescription('query to search')
                                .setRequired(true)
                                .setAutocomplete(true);
                        });
                })
                .addSubcommand(s => {
                    return s.setName('spotify')
                        .setDescription('play music from spotify')
                        .addStringOption(o => {
                            return o.setName('query')
                                .setDescription('query to search')
                                .setRequired(true)
                                .setAutocomplete(true);
                        });
                })
                .addSubcommand(s => {
                    return s.setName('twitch')
                        .setDescription('play stream sound from twitch')
                        .addStringOption(o => {
                            return o.setName('query')
                                .setDescription('query to search')
                                .setRequired(true)
                                .setAutocomplete(true);
                        });
                });
        })
        .addSubcommand(s => {
            return s.setName('stop')
                .setDescription('stop music');
        })
        .addSubcommand(s => {
            return s.setName('skip')
                .setDescription('skip music');
        })
        .addSubcommand(s => {
            return s.setName('pause')
                .setDescription('pause music')
                .addStringOption(o => {
                    return o.setName('query')
                        .setDescription('query to search')
                        .setRequired(true)
                        .addChoices(
                            {
                                name: 'pause',
                                value: 'pause',
                            },
                            {
                                name: 'resume',
                                value: 'resume',
                            },
                        );
                });
        })
        .addSubcommand(s => {
            return s.setName('volume')
                .setDescription('change volume')
                .addIntegerOption(o => {
                    return o.setName('volume')
                        .setDescription('volume to set')
                        .setRequired(true);
                });
        })
        .addSubcommand(s => {
            return s.setName('queue')
                .setDescription('show queue')
                .addIntegerOption(o => {
                    return o.setName('page')
                        .setDescription('page to show')
                        .setRequired(false);
                });
        })
        .addSubcommand(s => {
            return s.setName('loop')
                .setDescription('loop mode')
                .addIntegerOption(o => {
                    return o.setName('mode')
                        .setDescription('mode')
                        .setRequired(true)
                        .addChoices(
                            {
                                name: 'off',
                                value: 0,
                            },
                            {
                                name: 'track',
                                value: 1,
                            },
                            {
                                name: 'queue',
                                value: 2,
                            },
                            {
                                name: 'random',
                                value: 3,
                            },
                        );
                });
        })
        .addSubcommandGroup(s => {
            return s.setName('search')
                .setDescription('search music')
                .addSubcommand(ss => {
                    return ss.setName('twitch')
                        .setDescription('search music from youtube')
                        .addStringOption(o => {
                            return o.setName('query')
                                .setDescription('query to search');
                        })
                        .addStringOption(o => {
                            return o.setName('language')
                                .setDescription('language of the user')
                                .addChoices(
                                    {
                                        name: 'English',
                                        value: 'en',
                                    },
                                    {
                                        name: 'Francais',
                                        value: 'fr',
                                    },
                                    {
                                        name: 'Español',
                                        value: 'es',
                                    },
                                )
                                .setRequired(false);
                        })
                        .addBooleanOption(o => {
                            return o.setName('live')
                                .setDescription('live stream')
                                .setRequired(false);
                        })
                        .addIntegerOption(o => {
                            return o.setName('limit')
                                .setDescription('limit of the search')
                                .setRequired(false);
                        });
                });
        })
    , 'MUSIC'),

    handleAutoComplete: async (interaction, client, query) => {
        if (interaction.isAutocomplete()) {
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
    },
};