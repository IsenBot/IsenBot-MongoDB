const m3u8stream = require('m3u8stream');
const { stream } = require('play-dl');
const EventEmitter = require('node:events');
const { AudioPlayerStatus, createAudioPlayer, joinVoiceChannel, NoSubscriberBehavior, VoiceConnectionStatus } = require('@discordjs/voice');
const { shuffleArray } = require('../../utility/Function');
const { PermissionsBitField } = require('discord.js');

class Queue extends EventEmitter {
    constructor(client, guildId, player) {
        super();

        this.AudioPlayer = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Pause,
            },
        });

        this.client = client;
        this.guildId = guildId;
        this.player = player;

        this.AudioPlayer.on('stateChange', (oldState, newState) => {
            if (oldState.status !== AudioPlayerStatus.Idle && newState.status === AudioPlayerStatus.Idle) {
                this.skip();
            }
        });

        this.AudioPlayer.on('error', (error) => {
            console.log(error);
        });

        this.queue = [];
        this.history = [];
        this.actualResource = null;
        this.actualTrack = null;
        this._loop = 0;
        this._volume = 0.3;
        this.musicChannel = null;
        this.playing = false;
        this.maxHistory = 10;
    }

    connect(channel) {

        if (!channel?.isVoiceBased()) {
            this.queue = [];
            return 0;
        }

        const perms = channel.permissionsFor(this.client.user);
        if (!perms.has(PermissionsBitField.Flags.Connect)) return 2;

        if (this.connection?.state?.status === 'ready') return this.connection?.joinConfig?.channelId === channel.id ? 3 : 1;

        if (this.connection?.state?.status === 'disconnected') {
            this.connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator,
            });
            this.connection.subscribe(this.AudioPlayer);
            return 3;
        } else {
            this.musicChannel = channel;
            this.connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator,
                selfDeaf: true,
                selfMute: false,
            });

            this.connection.on(VoiceConnectionStatus.Ready, () => {
                this.emit('voiceConnectionReady', this);
            });

            this.connection.on(VoiceConnectionStatus.Disconnected, () => {
                this.emit('voiceConnectionDisconnected', this);
            });


            this.connection.subscribe(this.AudioPlayer);
            return 3;
        }
    }

    addTrack(track) {
        this.queue.push(track);
    }

    addTracks(tracks) {
        this.queue.push(...tracks);
    }

    addHistory(track) {
        if (this.history.length > this.maxHistory) this.history.pop();
        this.history.push(track);
    }

    getQueue() {
        return this.queue;
    }

    set volume(volume) {
        volume = Math.min(Math.max(volume, 0), 100);
        this._volume = volume / 100;
        this.actualResource?.volume?.setVolume(volume / 100);
    }

    get volume() {
        return this._volume * 100;
    }

    stop() {
        this.playing = false;
        this.actualResource = null;
        this.actualTrack = null;
        this.queue = [];
        this.AudioPlayer.stop(true);
        this.connection?.disconnect();
        this.emit('stop', this);
    }

    async play() {
        if (this.queue.length > 0) {

            switch (this._loop) {
            case loopMode.off:
                this.actualTrack = this.queue.shift();
                break;

            case loopMode.track:
                break;

            case loopMode.queue:
                this.queue.push(this.actualTrack);
                this.actualTrack = this.queue.shift();
                break;

            case loopMode.random:
                this.addHistory(this.actualTrack);
                this.actualTrack = this.queue[Math.floor(Math.random() * this.queue.length)];
                break;
            }

            if (this.actualTrack?.type === 'twitch') {
                this.actualResource = this.player.createResource(m3u8stream(this.actualTrack.twitchUrl, this.client.config.m3u8stream_options));
            } else {
                const source = await stream(this.actualTrack?.url);
                this.actualResource = this.player.createResource(source.stream, source.type);
            }

            this.setBitrate(this.musicChannel.bitrate > 64000 ? 64000 : this.musicChannel.bitrate);

            this.actualResource.volume.setVolume(this._volume);

            this.AudioPlayer.play(this.actualResource);

            this.playing = true;

            this.emit('playNext', this.actualTrack);
        } else {
            this.stop();
        }
    }

    pause() {
        if (this.AudioPlayer.state.status === AudioPlayerStatus.Playing) this.AudioPlayer.pause();
    }

    resume() {
        if (this.AudioPlayer.state.status === AudioPlayerStatus.Paused) this.AudioPlayer.unpause();
    }

    skip() {
        if (this.queue.length < 0) return this.stop();
        if (this.loop === 0) {
            this.addHistory(this.actualTrack);
        }
        setTimeout(() => this.play(), 1000);
    }

    getHistory() {
        return this.history;
    }

    clear() {
        this.queue = [];
    }

    shuffle() {
        if (this.queue.length > 0) this.queue = shuffleArray(this.queue);
    }

    set loopMode(mode) {

        if (typeof mode === 'string') {
            if (mode.length > 0) {
                mode = loopMode[mode.toLowerCase()];
            } else {
                mode = parseInt(mode, 10);
            }
        }

        if (typeof mode !== 'number') return;

        if (mode < 0 || mode > 3) return;

        this._loop = mode;
    }

    get loopMode() {
        return this._loop;
    }

    back() {
        if (this.history.length > 0) {
            this.queue.unshift(this.history.shift());
        }
    }

    setBitrate(bitrate) {
        if (this.musicChannel?.bitrate < bitrate) bitrate = this.musicChannel?.bitrate;

        this.actualResource?.encoder?.setBitrate(bitrate);
    }

    insert(track, index) {
        if (index < 0) return;

        index > this.queue.length ? this.queue.push(track) : this.queue.splice(index, 0, track);
    }
    remove(index) {
        if (index < 0 || index > this.queue.length - 1) return;
        return this.queue.splice(index, 1);
    }

    destroy() {
        this.queue = [];
        this.AudioPlayer.stop(true);
        this.connection?.destroy();
        this.removeAllListeners();
    }

    smoothVolume(volume, time = 1000) {
        const startVolume = this.volume;
        const endVolume = volume;
        const startTime = Date.now();
        const endTime = startTime + time;
        const interval = setInterval(() => {
            const now = Date.now();
            const progress = (now - startTime) / time;
            this.volume = startVolume + (endVolume - startVolume) * progress;
            if (now >= endTime) {
                clearInterval(interval);
            }
        }, 20);
    }
}

module.exports = Queue;

const loopMode = {
    off: 0,
    track: 1,
    queue: 2,
    random: 3,
};