const { formatLog } = require('../../utility/Log');
module.exports = {
    name : 'voiceConnectionReady',
    once : false,

    execute(queue) {
        queue.client.log({
            textContent: formatLog('Voice connection ready', { 'Music channel' : queue.musicChannel?.id }),
            headers: ['Logger', 'Music'],
            type: 'event',
        });
    },
};