const chalk = require('chalk');
require('dotenv').config();
module.exports = {
    token : process.env.TOKEN,
    database: {
        uri: process.env.DATABASE_URI,
        databaseName: 'guildConfiguration',
        guildTableName: 'guild',
        rolesReactionsTableName: 'roleReactMessage',
    },
    // Config for the log on discord and console
    log : {
        globalLogChannelId: 'id',
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
};