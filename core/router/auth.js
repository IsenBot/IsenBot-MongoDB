const express = require('express');

function getRouter(client) {
    const router = express.Router();

    router.get('*', (req, res) => {
        if ('code' in req.query && req.query.code) {
            const expiresAt = client.auth.addAuthUser(req.query.code);
            if (expiresAt) {
                res.status(200).send(`<h1>Connected !</h1><br><p>Refresh token will be edited at ${(new Date(expiresAt)).toLocaleDateString()}</p>`);
            }
        } else {
            res.status(200).send('<h1>Working - No code found !</h1>');
        }
    });

    return router;
}

module.exports = getRouter;