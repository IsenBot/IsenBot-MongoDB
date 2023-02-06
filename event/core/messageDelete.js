module.exports = {
    name: 'messageDelete',
    async execute(message) {
        await message.client.hours.deleteMany({ messageId: message.id });
    },
};