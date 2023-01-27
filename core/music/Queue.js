const m3u8stream = require('m3u8stream');
const ytdl = require('ytdl-core');
const EventEmitter = require('node:events');
const { AudioPlayerStatus, createAudioPlayer, joinVoiceChannel, NoSubscriberBehavior, VoiceConnectionStatus } = require('@discordjs/voice');
const { shuffleArray } = require('../../utility/Function');

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
            if (newState.status === AudioPlayerStatus.Idle && oldState.status !== AudioPlayerStatus.Idle) {
                if (this.loop === 0) {
                    if (this.history.length > 5) {
                        this.history.pop();
                    }
                    this.history.unshift(this.actualTrack);
                }
                setTimeout(() => {
                    this.play();
                }, 1000);
            }
        });

        this.AudioPlayer.on('error', (error) => {
            console.log(error);
        });


        this.queue = [];
        this.history = [];
        this.actualResource = null;
        this.actualTrack = null;
        this.loop = 0;
        this.volume = 0.25;
        this.musicChannel = null;
        this.playing = false;
    }

    connect(channel) {

        if (this.connection?.state?.status === 'ready') return;

        if (this.connection?.state?.status === 'disconnected') {
            this.connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator,
            });
            this.connection.subscribe(this.AudioPlayer);
        } else {
            this.musicChannel = channel;
            this.connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator,
            });

            this.connection.on(VoiceConnectionStatus.Ready, () => {
                this.emit('voiceConnectionReady', this);
            });

            this.connection.on(VoiceConnectionStatus.Disconnected, () => {
                this.emit('voiceConnectionDisconnected', this);
            });

            this.connection.subscribe(this.AudioPlayer);
        }
    }

    addTrack(track) {
        this.queue.push(track);
    }

    addTracks(tracks) {
        this.queue.push(...tracks);
    }

    getQueue() {
        return this.queue;
    }

    setVolume(volume) {
        volume = Math.min(Math.max(volume, 0), 100);
        this.volume = volume / 100;
        this.actualResource?.volume?.setVolume(volume / 100);
    }

    stop() {
        this.playing = false;
        this.actualResource = null;
        this.queue = [];
        this.AudioPlayer.stop(true);
        this.connection?.disconnect();
        this.emit('stop', this);
    }

    play() {
        if (this.queue.length > 0) {

            switch (this.loop) {
            // OFF
            case 0:
                this.actualTrack = this.queue.shift();
                break;

            // TRACK
            case 1:
                break;

            // QUEUE
            case 2:
                this.actualTrack = this.queue.shift();
                this.queue.push(this.actualTrack);
                break;

            // RANDOM
            case 3:
                this.actualTrack = this.queue[Math.floor(Math.random() * this.queue.length)];
                break;
            }

            if (this.actualTrack?.type === 'twitch') {
                this.actualResource = this.player.createResource(m3u8stream(this.actualTrack.twitchUrl, this.client.config.m3u8stream_options));
            } else {
                this.actualResource = this.player.createResource(ytdl(this.actualTrack?.url, this.client.config.player.ytdl_options));
            }

            this.setBitrate(64000);

            if (!this.actualTrack) return;
            this.actualResource?.volume?.setVolume(this.volume);

            this.AudioPlayer.play(this.actualResource);
            this.playing = true;
            this.emit('playNext', this.actualTrack);
        } else {
            this.stop();
        }
    }

    pause() {
        this.AudioPlayer.pause();
    }

    resume() {
        this.AudioPlayer.unpause();
    }

    skip() {
        setTimeout(() => {
            if (this.loop === 0) {
                if (this.history.length > 5) {
                    this.history.pop();
                }
                this.history.unshift(this.actualTrack);
            }
            this.play();
        }, 1000);
    }

    getHistory() {
        return this.history;
    }

    clear() {
        this.queue = [];
    }

    shuffle() {
        this.queue = shuffleArray(this.queue);
    }

    setLoopMode(mode) {
        this.loop = mode;
    }

    getLoopMode() {
        return this.loop;
    }

    insert(index, track) {
        this.queue.splice(index, 0, track);
    }

    back() {
        if (this.history.length > 0) {
            this.queue.unshift(this.history.shift());
        }
    }

    setBitrate(bitrate) {
        this.actualResource?.encoder?.setBitrate(bitrate);
    }

    remove(index) {
        return this.queue.splice(index, 1);
    }
}

module.exports = Queue;