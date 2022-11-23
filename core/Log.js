const { EmbedBuilder } = require('discord.js');
const EmbedOptions = require('../utility/Options/EmbedOptions');
const LogOptions = require('../utility/Options/LogOptions');
const { formatString, dateMatch, getFullDate, stringToEmbed, formatLog } = require('../utility/Log');
const { EventEmitter } = require('node:events');


// WARNING : DO NOT SAVE IN DATABASE
//
// Use to send log both in console and on discord log channel
class Logger extends EventEmitter {
    constructor(client) {
        super();
        // client which initiate this logger
        this.client = client;
        // guild which initiate this logger
        this.guild = null;
        // discord channel where to log
        this.logChannel = null;
        // The last thread used to log
        this.thread = null;
        // color for the embed
        this.embedColors = this.client.config.log.embedColors;
        // color for the console
        this.consoleColors = this.client.config.log.consoleColors;
        // If true, log on discord with embed
        this.defaultEmbed = this.client.config.log.defaultEmbed;

        this.logChain = new Promise((resolve) => {
            this.once('ready', () => resolve('Log channel set, start sending the log on discord on discord.'));
        });
        this.on('discordLog', this.callDiscordLog);
    }
    callDiscordLog(...options) {
        this.logChain = this.logChain.then(() => {
            return this.#discordLog(...options);
        });
    }

    static async create(client, extra = {}) {
        const logger = new this(client);
        if (extra.guild) {
            logger.guild = extra.guild;
        }
        logger.isClientLogger = extra.isClientLogger ?? false;
        try {
            if (extra.logChannelId) {
                logger.logChannel = await client.channels.fetch(extra.logChannelId);
            }
        } catch (e) {
            logger.logChannel = null;
            logger.log({
                textContent: formatLog('Failed to fetch log channel', { 'ChannelId': logger.logChannel?.id }),
                type: 'error',
                headers: 'Logger',
            });
        }
        return logger;
    }

    removeLogChannel() {
        this.logChannel = null;
        this.removeLogThread();
    }
    removeLogThread() {
        this.thread = null;
    }
    setLogChannel(newLogChannel) {
        this.logChannel = newLogChannel;
        this.removeLogThread();
    }
    async setLogChannelId(newLogChannelId) {
        try {
            this.logChannel = await this.client.channels.fetch(newLogChannelId);
        } catch (e) {
            this.logChannel = null;
            this.log({
                textContent: formatLog('Failed to fetch log channel', { 'ChannelId': newLogChannelId }),
                type: 'error',
                headers: 'Logger',
            });
            console.error(e);
        }
        this.removeLogThread();
    }

    // Create an embed for the given options, options are an EmbedOptions instance.
    createEmbed(options) {
        let embedOptionsBody;
        if (options instanceof EmbedOptions) {
            embedOptionsBody = options.resolve();
        } else {
            embedOptionsBody = EmbedOptions.create(options).resolve();
        }
        const { color, headers, textContent, url, author, guild, target } = embedOptionsBody;
        const { fields, description } = stringToEmbed(formatLog(textContent, { 'Target': target?.toString() }));
        const title = headers.map(header => header ? `[${header}]` : '').join('');

        return new EmbedBuilder()
            .setColor(color)
            .setTimestamp(Date.now())
            .setURL(url)
            .setTitle(title ? title : null)
            .setAuthor({
                iconURL: author?.displayAvatarURL() ?? null,
                name: author?.toString() ?? null,
            })
            .setDescription(description)
            .setFields(fields)
            .setFooter({
                text: guild ? `${guild?.name} | ${guild?.id}` : null,
                iconURL: guild?.iconURL() ?? null,
            });
    }

    #consoleLog(options) {
        let logOptions;
        if (options instanceof LogOptions) {
            logOptions = options;
        } else {
            logOptions = LogOptions.create(options, { guild: this.guild });
        }
        const logOptionsBody = logOptions.resolve();

        if (!logOptionsBody.isConsoleLog) {
            throw new Error('The options specify isConsoleLog: false');
        }

        const { type, headers, textContent, guild, author, target, url } = logOptionsBody;
        const colors = this.consoleColors,
            date = getFullDate(new Date(), 'DD/MM-HH:MIN');
        const formatedUrl = url ? formatString(colors.url, url) : url;

        let finalHeader = formatString(colors.date, `[${date}]`);
        if (type) {
            finalHeader += formatString(colors.type[type], `[${type.charAt(0).toUpperCase() + type.slice(1)}]`);
        }
        finalHeader += formatString(colors.header, headers.map(header => header ? `[${header}]` : '').join(''));

        const content = formatLog(textContent, {
            'Guild': guild?.id,
            'url': formatedUrl,
            'By': author,
            'Target': target,
        });

        (type === 'error' ? console.error : console.log)(finalHeader, content);
    }
    async #discordLog(options, thread = undefined) {
        if (!(this.logChannel || thread)) {
            // TODO : What to do ?
            return 'No log channel';
        }

        let logOptions;
        if (options instanceof LogOptions) {
            logOptions = options;
        } else {
            logOptions = LogOptions.create(options, { guild: this.guild });
        }
        const logOptionsBody = logOptions.resolve();

        if (!logOptionsBody.isDiscordLog) {
            throw new Error('The options specify isDiscordLog: false');
        }

        const { headers, textContent, author, target, url, type, guild, isEmbed } = logOptionsBody;

        if (!thread) {
            thread = await this.getTodayThread();
        }

        if (isEmbed ?? this.defaultEmbed) {
            return await thread.send({
                embeds : [this.createEmbed({
                    headers,
                    textContent,
                    author,
                    url,
                    color: this.embedColors[type],
                    target,
                    guild,
                })],
            });
        } else {
            let finalHeader = headers.map(header => header ? `[${header}]` : '').join('');
            if (type) {
                finalHeader += '[' + type.charAt(0).toUpperCase() + type.slice(1) + ']';
            }
            let content = formatLog(textContent, {
                'By': author,
                'Target': target,
            });
            if (this.isClientLogger) {
                content = formatLog(content, {
                    'Guild': guild?.id,
                });
            }
            content = formatLog(content, {
                'url': url,
            });
            if (finalHeader !== '') {
                finalHeader += ' ';
            }
            content = finalHeader + content;
            return await thread.send({ content });
        }
    }
    // TODO : Review the double log system
    log(options, thread = undefined) {
        // Resolve the options using LogOptions.
        let logOptions;
        if (options instanceof LogOptions) {
            logOptions = options;
        } else {
            logOptions = LogOptions.create(options, { guild: this.guild });
        }
        const logOptionsBody = logOptions.resolve();
        // If this logger instance is not the client's one, then call the client's one.
        if (!(this.isClientLogger)) {
            this.client.logger.log(logOptions);
        } else if (logOptionsBody.isConsoleLog) {
            this.#consoleLog(logOptions);
        }

        if (logOptionsBody.isDiscordLog) {
            try {
                this.emit('discordLog', logOptions, thread);
            } catch (e) {
                this.#consoleLog({
                    textContent: formatLog('Fail sending log', {
                        'At': this.logChannel.url,
                        '\nContent': logOptionsBody.textContent,
                    }),
                    type: 'error',
                    header: 'Logger',
                });
            }
        }
    }
    // LOG THREAD MANAGEMENT
    //
    // Check if a thread for the given date exist in the logChannel
    threadExist(date) {
        try {
            if (!(date instanceof Date)) {
                date = new Date(date);
            }
        } catch (e) {
            throw new Error('Invalid date');
            // console.error('Invalid date');
            // return false;
        }
        // TODO : Throw error if no log channel ??
        if (!this.logChannel) {
            // console.error('mettez un log channel');
            return false;
        }
        const threads = this.findThread(date);
        return !!threads;
    }
    // Fetch/create log thread for today.
    // Their must be a log channel in order to have a log thread.
    async getTodayThread() {
        // TODO : throw error ?
        if (!this.logChannel) {
            // console.error('mettez un log channel');
            return undefined;
        }
        const date = new Date();
        // Check if there is a stored thread and is the today log thread
        if (this.#isValidThread(this.thread, date)/* this.thread && this.thread.parentId === this.logChannel.id && dateMatch(this.thread, date)*/) {
            // If so return it
            return this.thread;
        }
        // Else If the thread for today exist, return it, otherwise, create one
        this.thread = this.threadExist(date) ? await this.findThread(date) : await this.#createThread();
        return this.thread;
    }
    // Create today log thread
    async #createThread() {
        // TODO : Maybe let an error occur if no log channel ? -> because involved wrong use of the function
        // if (!this.logChannel) {
        //     console.error('mettez un log channel');
        //     return undefined;
        // }
        const date = new Date();
        const thread = await this.logChannel.threads.create({
            name: getFullDate(date, 'YYYY-MM-DD'),
            reason: `Open log thread for ${getFullDate(date, 'YYYY-MM-DD')}`,
        });
        await this.log({
            textContent: formatLog('Log thread created', { 'GuildId': this.guild?.id }),
            type: 'log',
            headers: ['Logger', 'Thread'],
            url: thread.url,
        }, thread);
        return thread;
    }
    // Verify that, the given channel is a thread, the channel it belongs to is the log channel, it has been created by the bot and the date of the thread match the given date.
    #isValidThread(thread, date) {
        return thread?.isThread() && thread.parentId === this.logChannel.id && thread.ownerId === this.client.id && dateMatch(date, thread.createdAt);
    }
    // Find in the cache the log thread for the given date.
    findThread(date) {
        return this.client.channels.cache.find(x => this.#isValidThread(x, date)/* x.isThread() && x.parentId === this.logChannel && dateMatch(date, x.createdAt)*/);
    }
}

module.exports = Logger;