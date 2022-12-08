class GuildSchema {
    constructor(fields) {
        if (!fields?._id) {
            throw new Error('you must give at least the _id field');
        }
        const { _id, logChannelId } = fields;
        this._id = _id;
        this.logChannelId = logChannelId ?? null;
    }
}

class RoleReactionSchema {
    constructor(fields) {
        if (!fields?._id) {
            throw new Error('you must give at least the _id field');
        }
        const { _id, channelId, guildId } = fields;
        this._id = _id;
        this.channelId = channelId ?? null;
        this.guildId = guildId ?? null;
    }
}

module.exports = {
    GuildSchema,
    RoleReactionSchema,
};