const path = require('node:path');
const { SlashCommandBuilder } = require('discord.js');
const { initLanguage } = require('../../utility/commandBuilder');

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
                    return o.setName('mode')
                        .setDescription('mode')
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
                        .setDescription('volume to set');
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
        .addSubcommand(s => {
            return s.setName('remove')
                .setDescription('remove a track')
                .addIntegerOption(o => {
                    return o.setName('index')
                        .setDescription('index of the track to remove')
                        .setRequired(true);
                });
        })
    , 'music'),
};