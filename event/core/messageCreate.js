module.exports = {
    name: 'messageCreate',
    async execute(message) {
        const { content, channel, member } = message
        if (member?.user.bot) return;
        if (content.toLowerCase().endsWith("quoi")) {
            return channel.send("Feur :ChadLeandro:")
        }
    },
};