module.exports = {
    name: 'messageDelete',
    async execute(message) {
        const db = await message.client.guildDB(message.guildId);
        await db.collection('isen/hours').deleteMany({ messageId: message.id });
    },
};