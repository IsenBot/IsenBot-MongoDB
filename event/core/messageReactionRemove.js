const { formatLog } = require('../../utility/Log');
const { getRoleReaction } = require('../../utility/database');

module.exports = {
    name: 'messageReactionRemove',
    async execute(messageReaction, user) {
        if (user.bot) {
            return;
        }
        const client = messageReaction.client;
        // Check if a role react is set on this message
        const roleReactData = await getRoleReaction(client, messageReaction.message, messageReaction.emoji.toString());
        if (roleReactData) {
            if (messageReaction.me && await messageReaction.message.guild.members.fetch(roleReactData.roles[0])) {
                const guild = messageReaction.message.guild;
                try {
                    const role = await guild.roles.fetch(roleReactData.roles[0]);
                    const member = await guild.members.fetch(user);
                    await member.roles.remove(role, 'Remove reaction on role react');
                    guild.logger.log({
                        textContent: formatLog('Successfully remove role', {
                            'Role': role.name,
                            'Reaction': messageReaction.emoji,
                        }),
                        headers: ['Role', 'Reaction'],
                        type: 'success',
                        target: user,
                        url: messageReaction.message.url,
                    });
                    user.send(client.translate('EVENT/CORE/MESSAGEREACTIONREMOVE:ROLE_REACT:ROLE_REMOVED', {
                        roles: role.name,
                        guild: guild.name,
                    }, user.local)).catch();
                    // eslint-disable-next-line brace-style
                }
                // In case it can't give the role
                catch (err) {
                    guild.logger.log({
                        textContent: formatLog('Fail to remove role', {
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
            }
        }
    },
};