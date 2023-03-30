const { formatLog } = require('../../utility/Log');

class SpotifyApi {
    constructor(client) {
        this.client = client;
        this.access_token = null;
        this.client_id = this.client.config.player.key.spotifyClient;
        this.client_secret = this.client.config.player.key.spotifySecret;
        this.expires_in = null;
    }

    async fetchToken() {
        const data = await fetch(`https://accounts.spotify.com/api/token?grant_type=client_credentials&client_id=${this.client_id}&client_secret=${this.client_secret}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
            .then(res => {
                if (res.status === 200) {
                    return res.json();
                }
                this.client.log({
                    textContent: formatLog('Could not fetch Spotify Token. Try resetting client id and secret', { status: res.status, error: res.statusText }),
                    headers: 'Spotify',
                    type: 'Error',
                });
                return;
            })
            .catch(error => {
                this.client.log({
                    textContent: formatLog('Could not fetch Spotify Token because of networking error. Retrying in 30 sec', { error: error.message }),
                    headers: 'Spotify',
                    type: 'Error',
                });

                setTimeout(() => {
                    this.fetchToken();
                }, 30000);
            });

        if (data) {
            this.access_token = data.access_token;

            this.client.log({
                textContent: 'Spotify token fetch',
                headers: 'Spotify',
                type: 'Success',
            });

            this.expires_in = Date.now() + data.expires_in * 1000;
        }
    }

    async search(query, type = ['track'], limit = 1) {
        if (Date.now() > this.expires_in) {
            await this.fetchToken();
        }

        return await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=${type.join(',')}&limit=${limit}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.access_token}`,
            },
        })
            .then(res => res.status === 200 ? res.json() : undefined)
            .catch(error => {
                this.client.log({
                    textContent: formatLog('Could not search on Spotify because of networking error', { error: error.message }),
                    headers: ['Spotify', 'Search'],
                    type: 'Error',
                });
            });
    }

    async getById(id, type = 'track') {
        if (Date.now() > this.expires_in) {
            await this.fetchToken();
        }

        switch (type) {

        case 'track':
            return this.trackById(id);

        case 'artist':
            return this.artistById(id);

        case 'playlist':
            return this.playlistById(id);

        case 'album':
            return this.albumById(id);
        default:
            return null;
        }
    }

    async trackById(id) {
        if (Date.now() > this.expires_in) {
            await this.fetchToken();
        }

        return await fetch(`https://api.spotify.com/v1/tracks/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.access_token}`,
            },
        })
            .then(res => res.status === 200 ? res.json() : undefined)
            .catch(error => {
                this.client.log({
                    textContent: formatLog('Could not get track on Spotify because of networking error', { error: error.message, trackId: id }),
                    headers: ['Spotify', 'TrackById'],
                    type: 'Error',
                });
            });
    }

    async artistById(id) {
        if (Date.now() > this.expires_in) {
            await this.fetchToken();
        }

        return await fetch(`https://api.spotify.com/v1/artists/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.access_token}`,
            },
        })
            .then(res => res.status === 200 ? res.json() : undefined)
            .catch(error => {
                this.client.log({
                    textContent: formatLog('Could not get artist on Spotify because of networking error', { error: error.message, artistId: id }),
                    headers: ['Spotify', 'ArtistById'],
                    type: 'Error',
                });
            });
    }

    async playlistById(id) {
        return await fetch(`https://api.spotify.com/v1/playlists/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.access_token}`,
            },
        })
            .then(res => res.status === 200 ? res.json() : undefined)
            .catch(error => {
                this.client.log({
                    textContent: formatLog('Could not get playlist on Spotify because of networking error', { error: error.message, playlistId: id }),
                    headers: ['Spotify', 'PlaylistById'],
                    type: 'Error',
                });
            });
    }

    async albumById(id) {
        return await fetch(`https://api.spotify.com/v1/albums/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.access_token}`,
            },
        })
            .then(res => res.status === 200 ? res.json() : undefined)
            .catch(error => {
                this.client.log({
                    textContent: formatLog('Could not get album on Spotify because of networking error', { error: error.message, albumId: id }),
                    headers: ['Spotify', 'AlbumById'],
                    type: 'Error',
                });
            });
    }
}

module.exports = { SpotifyApi };