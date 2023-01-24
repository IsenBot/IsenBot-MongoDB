const { Client } = require('spotify-api.js');
class SpotifyApi {
    constructor(client) {
        this.bot = client;
        this.client = new Client({ token: { clientID: this.bot.config.player.key.spotifyClient, clientSecret: this.bot.config.player.key.spotifySecret } });
    }

    async searchTrack(query) {
        return await this.client.tracks.get(query);
    }

    async searchArtist(query) {
        return await this.client.artists.get(query);
    }

    async searchAlbum(query) {
        return await this.client.albums.get(query);
    }

    async searchPlaylist(query) {
        return await this.client.playlists.get(query);
    }

    async search(query, limit = 1) {
        const options = {
            limit,
            offset: 0,
            types: ['album', 'artist', 'track', 'episode'],
        };
        return await this.client.search(query, options);
    }
}

module.exports = { SpotifyApi };