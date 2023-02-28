const { formatLog } = require('../../utility/Log');
module.exports = {
    name : 'voiceConnectionDisconnected',
    once : false,

    execute(queue) {
        queue.client.log({
            textContent: formatLog('Voice connection deleted', { 'Music channel' : queue.musicChannel?.id }),
            headers: ['Logger', 'Music'],
            type: 'event',
        });
    },
};