const chalk = require('chalk');
require('dotenv').config();
module.exports = {
    token: process.env.TOKEN,
    oAuthToken: process.env.DISCORD_OAUTH_TOKEN,
    database: {
        uri: process.env.DATABASE_URI,
        databaseName: 'isenbot_db',
        guildTableName: 'guild',
        rolesReactionsTableName: 'roleReact',
        rolesReactionsConfigTableName: 'roleReactConfig',
        hoursTableName: 'hours',
        messagesToDeleteTableName: 'messageToDelete',
    },
    // Config for the log on discord and console
    log: {
        globalLogChannelId: process.env.GLOBAL_LOG_CHANNEL_ID,
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
    api: {
        URI: process.env.API_URI ? process.env.API_URI : ('http://localhost:' + (process.env.API_PORT ? Number(process.env.API_PORT) : 8080)),
        port: process.env.API_PORT ? Number(process.env.API_PORT) : 8080,
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
        m3u8stream_options: {
            highWaterMark: 1 << 62,
        },
    },
};