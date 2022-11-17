module.exports = {
    name: 'threadDelete',
    async execute(thread) {
        const client = thread.client;
        const guild = thread.guild;
        // The thread is only store locally, not in the database
        if (guild.logger?.thread?.id === thread.id) {
            guild.logger.removeLogThread();
            guild.logger.log({
                textContent: 'Log thread deleted',
                headers: ['Logger', 'Thread'],
                type: 'event',
            });
        }
        if (client.logger.thread?.id === thread.id) {
            client.logger.removeLogThread();
            client.log({
                textContent: 'Client log thread deleted',
                headers: ['Logger', 'Thread'],
                type: 'event',
            });
        }
    },
};