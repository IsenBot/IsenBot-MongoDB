class TwitchApi {
    constructor(client) {
        this.client = client;
        this.Client_id = client.config.player.key.twitchClient;
        this.Client_secret = client.config.player.key.twitchSecret;
    }

    async fetchToken() {
        const data = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${this.Client_id}&client_secret=${this.Client_secret}&grant_type=client_credentials`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(res => res.json())
            .catch(err => console.error(err));

        this.client.log({
            textContent: 'Twitch token fetch',
            headers: 'Twitch',
            type: 'Success',
        });

        this.token = data.access_token;

        setInterval(() => {
            this.fetchToken();
        }, 86400000);
    }

    async fetchChannel(userId) {
        return await fetch(`https://api.twitch.tv/helix/channels?broadcaster_id=${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Client-Id': this.Client_id,
            },
        })
            .then(res => res.json())
            .catch(err => console.error(err));
    }
    async fetchUser(username) {
        return await fetch(`https://api.twitch.tv/helix/users?login=${username}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Client-Id': this.Client_id,
            },
        }).then(res => res.json())
            .catch(err => console.error(err));
    }

    async fetchStream(option) {
        return await fetch(`https://api.twitch.tv/helix/streams?${option.user_id ? 'user_id=' + option.user_id + '&' : ''}${option.language ? 'language=' + option.language + '&' : ''}${option.user_login ? 'user_login=' + option.user_login + '&' : ''}${option.type ? 'type=' + option.type + '&' : ''}${option.limit ? 'first=' + option.limit : '5'}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Client-Id': this.Client_id,
            },
        }).then(res => res.json())
            .catch(err => console.error(err));
    }

    async fetchQuery(query, maxResults = 5, isLive = true) {
        return await fetch(`https://api.twitch.tv/helix/search/channels?query=${query}&first=${maxResults}&live_only=${isLive}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Client-Id': this.Client_id,
            },
        }).then(res => res.json())
            .catch(err => console.error(err));
    }
}

module.exports = TwitchApi;