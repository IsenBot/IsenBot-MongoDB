const { formatLog } = require('../../utility/Log');
module.exports = {
    name : 'voiceConnectionDestroyed',
    once : false,

    execute(queue) {
        queue.client.log({
            textContent: formatLog('Voice connection deleted', { 'Music channel' : queue.musicChannel?.id, 'Bitrate' : queue.musicChannel.bitrate }),
            headers: ['Logger', 'Music'],
            type: 'event',
        });
    },
};