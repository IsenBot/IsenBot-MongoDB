module.exports = {
    name: 'messageCreate',
    async execute(message) {
        const { content, member } = message
        if (member?.user.bot) return;
        if (content.toLowerCase().endsWith("quoi")) {
            return message.reply({content: "Feur :ChadLeandro:"})
        }
    },
};