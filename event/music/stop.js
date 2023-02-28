module.exports = {
    name: 'stop',
    once: false,

    execute: async (queue) => {
        queue.musicChannel?.send('Stopped the music');
    },
};