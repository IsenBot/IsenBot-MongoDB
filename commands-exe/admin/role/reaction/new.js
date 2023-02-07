const { fetchError } = require('../../../../core/error/IsenBotError');
const { addRoleReaction } = require('../../../../utility/database');

module.exports = async function(interaction) {
    await interaction.deferReply({ ephemeral: true });
    // Get option
    const emoji = interaction.options.getString('reaction');
    const role = interaction.options.getRole('role');
    const channel = interaction.options.getChannel('channel') ?? interaction.channel;
    // Execute
    if (!channel.isTextBased()) {
        // TODO : send back a message
        return;
    }
    if (!role.editable) {
        // TODO : send back a message
        return;
    }
    if (role.name === '@everyone') {
        // TODO : send back a message
        return;
    }
    let messageContent = interaction.translate('admin/role/reaction/new:MESSAGE:MAIN_CONTENT');
    messageContent += interaction.translate('admin/role/reaction/new:MESSAGE:LIST_ELEMENT', { reaction: emoji, role: role.toString() });
    const message = await channel.send(messageContent);
    try {
        // eslint-disable-next-line max-statements-per-line
        await message.react(emoji).catch(err => {message.delete; throw err;});
        await addRoleReaction(interaction.client, message, emoji, role.id, false);
        await interaction.editReply(interaction.translate('admin/role/reaction/new:REPLY', { emoji:emoji, role:role.toString(), link: message.url }));
    } catch (e) {
        throw fetchError(e);
    }
};