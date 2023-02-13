const { formatLog } = require('../../utility/Log');
const { getRoleReaction } = require('../../utility/database');

function hasAlreadyReact(messageReaction, user) {
    const messageReactions = messageReaction.message.reactions.cache.map(mR => mR);
    for (const mR of messageReactions) {
        if (mR !== messageReaction && mR.users.resolve(user.id)) {
            return true;
        }
    }
    return false;
}

module.exports = {
    name: 'messageReactionAdd',
    async execute(messageReaction, user) {
        if (user.bot) {
            return;
        }
        const client = messageReaction.client;
        // TODO : MULTI ROLE REACT
        // Check if a role react is set on this message
        const roleReactData = await getRoleReaction(client, messageReaction.message, messageReaction.emoji.toString());
        if (roleReactData) {
            if (messageReaction.me && !(!roleReactData.isMultipleChoice && hasAlreadyReact(messageReaction, user))) {
                const guild = messageReaction.message.guild;
                try {
                    const role = await guild.roles.fetch(roleReactData.roles[0]);
                    const member = await guild.members.fetch(user);
                    await member.roles.add(role, 'add reaction on role react');
                    guild.logger.log({
                        textContent: formatLog('Successfully give role', {
                            'Role': role.name,
                            'Reaction': messageReaction.emoji,
                        }),
                        headers: ['Role', 'Reaction'],
                        type: 'success',
                        target: user,
                        url: messageReaction.message.url,
                    });
                    user.send(client.translate('event/core/messageReactionAdd:ROLE_REACT:ROLE_ADDED', {
                        roles: role.name,
                        guild: guild.name,
                    }, user.local)).catch();
                    // eslint-disable-next-line brace-style
                }
                // In case it can't give the role
                catch (err) {
                    guild.logger.log({
                        textContent: formatLog('Fail to give role', {
                            'Role': roleReactData.roles,
                            'Reaction': messageReaction.emoji,
                        }),
                        headers: ['Role', 'Reaction'],
                        type: 'error',
                        target: user,
                        url: messageReaction.message.url,
                    });
                    console.log(err);
                }
            } else {
                try {
                    await messageReaction.users.remove(user.id);
                } catch (e) {
                    console.error(e);
                }
            }
        }
    },
};