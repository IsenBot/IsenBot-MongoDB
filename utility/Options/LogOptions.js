class LogOptions {
    constructor(options) {
        this.options = options;
        this.body = null;
    }

    /* Options list :
    * type
    * headers
    * textContent
    * author
    * target
    * url
    * isEmbed
    * isDiscordLog
    * isConsoleLog
    * guild
    * */

    resolve() {
        if (this.body) return this.body;

        if (this.options instanceof String) {
            const textContent = this.options;
            this.options = {};
            this.options.textContent = textContent;
        }

        const { headers, textContent, author, target, url, isEmbed, isConsoleLog, isDiscordLog, guild, type } = this.options;

        this.body = {
            type: type.toLowerCase(),
            headers: headers instanceof String ? [headers] : headers,
            textContent,
            author,
            target,
            url,
            guild,
            isEmbed,
            isConsoleLog: isConsoleLog ?? true,
            isDiscordLog: isDiscordLog ?? true,
        };
        return this.body;
    }

    static create(options, extra = {}) {
        if (!(options instanceof Object)) {
            throw new Error('options must be an object');
        }
        return new this({ ...options, ...extra });
    }
}

module.exports = LogOptions;