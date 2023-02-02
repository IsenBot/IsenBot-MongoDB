class GuildSchema {
    constructor(fields) {
        if (!fields?.messageId) {
            throw new Error('you must give at least the messageId field');
        }
        const { messageId, logChannelId } = fields;
        this.messageId = messageId;
        this.logChannelId = logChannelId ?? null;
    }
}

class RoleReactionSchema {
    constructor(fields) {
        if (!(fields?.messageId && fields?.reaction)) {
            throw new Error('You must give at least the messageId and reaction field');
        }
        const { messageId, channelId, guildId, reaction, roles, isMultipleChoice } = fields;
        // noinspection EqualityComparisonWithCoercionJS
        if (roles == undefined) {
            throw new Error('You must provide at least one role');
        }
        this.messageId = messageId;
        this.reaction = reaction ?? null;
        this.channelId = channelId ?? null;
        this.guildId = guildId ?? null;
        this.isMultipleChoice = !!isMultipleChoice;
        this.roles = (typeof roles === 'string' || roles instanceof String) ? [roles] : roles;
    }
}

module.exports = {
    GuildSchema,
    RoleReactionSchema,
};