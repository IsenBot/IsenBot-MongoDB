const { formatLog } = require('../../utility/Log');
module.exports = {
    name : 'voiceConnectionConnected',
    once : false,

    execute(queue) {
        queue.client.log({
            textContent: formatLog('Voice connection created', { 'Music channel' : queue.musicChannel?.id }),
            headers: ['Logger', 'Music'],
            type: 'event',
        });
    },
};