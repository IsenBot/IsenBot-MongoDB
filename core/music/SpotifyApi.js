class SpotifyApi {
    constructor(client) {
        this.client = client;
        this.access_token = null;
        this.client_id = this.client.config.player.key.spotifyClient;
        this.client_secret = this.client.config.player.key.spotifySecret;
    }

    async fetchToken() {
        const data = await fetch(`https://accounts.spotify.com/api/token?grant_type=client_credentials&client_id=${this.client_id}&client_secret=${this.client_secret}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
            .then(res => res.json())
            .catch(err => console.error(err));

        this.access_token = data.access_token;

        this.client.log({
            textContent: 'Spotify token fetch',
            headers: 'Spotify',
            type: 'Success',
        });

        setTimeout(() => {
            this.fetchToken();
        }, data.expires_in * 1000);
    }

    async search(query, type = ['track'], limit = 1) {
        return await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=${type.join(',')}&limit=${limit}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.access_token}`,
            },
        })
            .then(res => res.json())
            .catch(err => console.error(err));
    }

    async getById(id, type = 'track') {
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
        return await fetch(`https://api.spotify.com/v1/tracks/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.access_token}`,
            },
        })
            .then(res => res.json())
            .catch(err => console.error(err));
    }

    async artistById(id) {
        return await fetch(`https://api.spotify.com/v1/artists/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.access_token}`,
            },
        })
            .then(res => res.json())
            .catch(err => console.error(err));
    }

    async playlistById(id) {
        return await fetch(`https://api.spotify.com/v1/playlists/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.access_token}`,
            },
        })
            .then(res => res.json())
            .catch(err => console.error(err));
    }

    async albumById(id) {
        return await fetch(`https://api.spotify.com/v1/albums/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.access_token}`,
            },
        })
            .then(res => res.json())
            .catch(err => console.error(err));
    }
}

module.exports = { SpotifyApi };