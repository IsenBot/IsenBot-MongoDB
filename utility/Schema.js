class GuildSchema {
    constructor(fields) {
        if (!fields?.guildId) {
            throw new Error('you must give at least the guildId field');
        }
        const { guildId, logChannelId } = fields;
        this.guildId = guildId;
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

class HoursSchema {
    constructor(fields) {
        const { messageId, guildId, userId, author, minutes, hours, title, description, added } = fields;
        this.messageId = messageId;
        this.guildId = guildId ?? null;
        this.userId = userId ?? null;
        this.author = author ?? null;
        this.title = title ?? null;
        this.description = description ?? null;
        this.minutes = minutes ?? 0;
        this.hours = hours ?? 0;
        this.added = added ?? new Date().toLocaleString('fr-FR');
    }
}

module.exports = {
    GuildSchema,
    RoleReactionSchema,
    HoursSchema,
};