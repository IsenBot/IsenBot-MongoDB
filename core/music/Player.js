const { createAudioResource, StreamType } = require('@discordjs/voice');
const { Collection } = require('discord.js');
const EventEmitter = require('node:events');
const { SpotifyApi } = require('./SpotifyApi');
const YouTube = require('youtube-sr').default;

const twitch = require('twitch-m3u8');
const Queue = require('./Queue');
const TwitchApi = require('./TwitchApi');
class Player extends EventEmitter {
    constructor(client) {
        super();
        this.client = client;
        this.spotifyClient = new SpotifyApi(client);
        this.twitchApi = new TwitchApi(client);
        // eslint-disable-next-line no-empty-function
        this.twitchApi.fetchToken().then(() => {});
        this.queue = new Collection();
    }

    createResource(resource) {
        return createAudioResource(resource, {
            inlineVolume: true,
            inputType: StreamType.Arbitrary,
        });
    }

    async searchYoutubeTrackById(id) {
        const track = await YouTube.search(id, { type: 'video', limit: 1 });

        if (!track) return null;

        return {
            title: track[0].title || 'No title',
            channelTitle: track[0].channel?.name,
            url: track[0].url,
            type: 'youtube',
            thumbnail: track[0].thumbnail?.url,
            avatarUrl: track[0].channel?.icon?.url,
            duration: track[0].duration,
            description: track[0].description,
        };
    }

    async searchYoutubeTrack(query, limit = 1) {
        const search = await YouTube.search(query, { type: 'video', limit });

        if (search.length === 0) return null;

        return {
            title: search[0].title || 'No title',
            channelTitle: search[0].channel?.name,
            url: search[0].url,
            type: 'youtube',
            thumbnail: search[0].thumbnail?.url,
            avatarUrl: search[0].channel?.icon?.url,
            duration: search[0].duration,
            description: search[0].description,
        };
    }

    async searchTwitchStreamTrack(username) {

        const stream = await twitch.getStream(username);

        if (!stream || stream.length === 0) return null;

        let track = stream.filter((item) => {return item.quality === 'audio_only'; })[0];

        if (!track) track = stream[stream.length - 1];

        if (track.url.length < 2) return null;

        return { title: username + ' stream', channelTitle: username, url: 'https://www.twitch.tv/' + username.toLowerCase(), twitchUrl: track.url, type: 'twitch' };
    }


    getQueue(guildId) {
        return this.queue.get(guildId);
    }

    createQueue(guildId) {
        const queue = new Queue(this.client, guildId, this);
        this.setQueue(guildId, queue);

        queue.on('playNext', (track) => {
            this.emit('playNext', queue, track);
        });

        queue.on('stop', (q) => {
            this.emit('stop', q);
        });

        queue.on('voiceConnectionConnected', (q) => {
            this.emit('voiceConnectionConnected', q);
        });

        queue.on('voiceConnectionDestroyed', (q) => {
            this.emit('voiceConnectionDestroyed', q);
        });

        this.setQueue(guildId, queue);
    }

    setQueue(guildId, queue) {
        this.queue.set(guildId, queue);
    }
    deleteQueue(guildId) {
        this.queue.delete(guildId);
    }
}

module.exports = { Player };