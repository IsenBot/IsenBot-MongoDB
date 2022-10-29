class EmbedOptions {
    constructor(options) {
        this.options = options;
        this.body = null;
    }
    /* Options list :
    * color
    * header
    * textContent
    * author
    * url
    * */
    resolve() {
        if (this.body) return this.body;

        const { color, headers, textContent, author, target, url, guild } = this.options;

        this.body = {
            color,
            headers,
            textContent,
            author,
            target,
            url,
            guild,
        };
        return this.body;
    }

    static create(options) {
        if (!(options instanceof Object)) {
            throw new Error('options must be an object');
        }
        return new this(options);
    }
}

module.exports = EmbedOptions;