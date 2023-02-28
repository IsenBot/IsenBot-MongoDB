const express = require('express');
const bodyParser = require('body-parser');
const getAuthRouter = require('./router/auth');
const { formatLog } = require('../utility/Log');

class Api {
    constructor(client, options) {
        this.client = client;
        this.port = client.config.api.port;
        this.URI = client.config.api.URI;
        this.app = express();
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.authPath = '/' + (options && 'authPath' in options ? options.authPath : 'auth').replaceAll('/', '');
        const authRouter = getAuthRouter(client);
        this.app.use(this.authPath, authRouter);
    }

    start() {
        this.client.log({
            textContent: formatLog('Starting API...', { baseURI: this.URI, port: this.port }),
            headers: 'Api',
            type: 'event',
        });
        this.app.listen(this.port, () => {
            this.client.log({
                textContent: formatLog('Successfully started API', { baseURI: this.URI, port: this.port }),
                headers: 'Api',
                type: 'success',
            });
        });
    }
}

module.exports = Api;