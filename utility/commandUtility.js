const { fetchError } = require('../core/error/IsenBotError');
async function getMessageFromId(interaction) {
    const channel = interaction.options.getChannel('channel');
    const messageId = interaction.options.getString('message_id');
    let message;
    try {
        message = await channel.messages.fetch(messageId);
    } catch (e) {
        await interaction.editReply({
            content: interaction.translate('error:CANT_GET_MESSAGE', { link: messageId }),
            ephemeral: true,
        });
        throw fetchError(e, messageId);
    }
    return message;
}

module.exports = {
    getMessageFromId,
};