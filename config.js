const chalk = require('chalk');
require('dotenv').config();
module.exports = {
    token : process.env.TOKEN,
    database: {
        uri: process.env.DATABASE_URI,
        databaseName: 'guildConfiguration',
        guildTableName: 'guild',
        rolesReactionsTableName: 'roleReact',
        rolesReactionsConfigTableName: 'roleReactConfig',
        hoursTableName: 'hours',
    },
    // Config for the log on discord and console
    log : {
        globalLogChannelId: '1020658285474500648',
        // If true, log on discord with embed and not plain text
        defaultEmbed: true,
        // Color rule for log message in console
        consoleColors: {
            url: chalk.blue.underline,
            date: chalk.gray.bgBlack,
            header: chalk.bold,
            type: {
                log: chalk.bgHex('#5865f2').black,
                success: chalk.bgHex('#18c406').black,
                error: chalk.bgHex('#e40613').black,
                event: chalk.bgHex('#e3bd2c').black,
            },
        },
        // Color rule for log message in discord as embed
        embedColors: {
            log: '#5865f2',
            success: '#1ce406',
            error: '#e40613',
            event: '#e3bd2c',
        },
    },
    apiKeys: {
        blagues: process.env.BLAGUES_API_KEY,
    },
    embed: {
        color: '#e40613',
        thumbnail: 'https://upload.wikimedia.org/wikipedia/fr/f/f0/Yncrea_BM_ISEN-_horizontal-1.jpg',
    },
    dontDeploy:[],
    player: {
        key: {
            twitchClient: process.env.TWITCH_CLIENT_ID,
            twitchSecret: process.env.TWITCH_CLIENT_SECRET,
            spotifyClient: process.env.SPOTIFY_CLIENT_ID,
            spotifySecret: process.env.SPOTIFY_CLIENT_SECRET,
        },
        ytdl_options: {
            quality: 'lowestaudio',
            filter: 'audioonly',

            // Do not modify
            highWaterMark: 1 << 62,
            liveBuffer: 1 << 62,
            dlChunkSize: 0,
            bitrate: 64,
        },
        m3u8stream_options: {
            highWaterMark: 1 << 62,
        },
    },
};