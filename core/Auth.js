const { formatLog } = require('../utility/Log');

class Auth {
    constructor(client) {
        this.usersTokens = {};
        this.secret = client.config.oAuthToken;
        this.id = client.user.id;
        this.redirectUri = client.config.api.URI + client.api.authPath;
        this.client = client;
    }

    #addAuthUserCredentials(userId, credentials) {
        if ('expiresAt' in credentials && 'token' in credentials && 'refreshToken' in credentials) {
            this.usersTokens[userId] = credentials;
        }
    }

    async #getUserIdFromToken(token) {
        const headers = new Headers({
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${token}`,
        });
        const data = await fetch('https://discord.com/api/users/@me', {
            method: 'GET',
            headers: headers,
        })
            .then(res => {
                if (res.status === 200) {
                    return res.json();
                }
                this.client.log({
                    textContent: formatLog('Failed getting user information', { status: res.status, error: res.statusText }),
                    headers: 'Auth',
                    type: 'error',
                });
            })
            .catch(e => {
                this.client.log({
                    textContent: formatLog('Failed getting user information', { error: e.messsage }),
                    headers: 'Auth',
                    type: 'error',
                });
            });
        return data?.id;
    }

    async addAuthUser(code) {
        const headers = new Headers({
            'Content-Type': 'application/x-www-form-urlencoded',
        });
        const body = new URLSearchParams({
            client_id: this.id,
            client_secret: this.secret,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: this.redirectUri,
        });
        const data = await fetch('https://discord.com/api/v10/oauth2/token', {
            method: 'POST',
            headers: headers,
            body: body,
        })
            .then(res => {
                if (res.status === 200) {
                    return res.json();
                }
                this.client.log({
                    textContent: formatLog('Failed getting user token', { status: res.status, error: res.statusText }),
                    headers: 'Auth',
                    type: 'error',
                });
            })
            .catch(e => {
                this.client.log({
                    textContent: formatLog('Failed getting user token', { error: e.messsage }),
                    headers: 'Auth',
                    type: 'error',
                });
            });
        if ('access_token' in data && 'refresh_token' in data && 'expires_in' in data) {
            const userId = await this.#getUserIdFromToken(data.access_token);
            if (userId) {
                this.#addAuthUserCredentials(userId, {
                    expiresAt: Date.now() + data.expires_in,
                    token: data.access_token,
                    refreshToken: data.refresh_token,
                });
                return Date.now() + data.expires_in;
            }
            // invalid user (should never happend) & already logged an error in this.#getUserIdFromToken
        }
        // invalid code (may happend) & already logged an error (status !== 200) or catch fetch error
    }

    async #refreshCredentials(userId) {
        const headers = new Headers({
            'Content-Type': 'application/x-www-form-urlencoded',
        });
        const body = new URLSearchParams({
            client_id: this.id,
            client_secret: this.secret,
            grant_type: 'refresh_token',
            refresh_token: this.usersTokens[userId].refreshToken,
        });
        const data = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            headers: headers,
            body: body,
        })
            .then(res => {
                if (res.status === 200) {
                    return res.json();
                }
                this.client.log({
                    textContent: formatLog('Failed refreshing user token', { status: res.status, error: res.statusText }),
                    headers: 'Auth',
                    type: 'error',
                });
            })
            .catch(e => {
                this.client.log({
                    textContent: formatLog('Failed refreshing user token', { error: e.messsage }),
                    headers: 'Auth',
                    type: 'error',
                });
            });
        if ('access_token' in data && 'refresh_token' in data && 'expires_in' in data) {
            this.usersTokens[userId] = {
                expiresAt: Date.now() + data.expires_in,
                token: data.access_token,
                refreshToken: data.refresh_token,
            };
            return this.usersTokens[userId].expiresAt;
        }
    }

    async getToken(userId) {
        if (userId in this.usersTokens) {
            if (this.usersTokens[userId].expiresAt < Date.now() - 10000) {
                return this.usersTokens[userId].token;
            } else {
                const expiresAt = await this.#refreshCredentials(userId);
                if (expiresAt && expiresAt > Date.now() - 10000) {
                    return this.usersTokens[userId].token;
                }
            }
        }
    }
}

module.exports = Auth;