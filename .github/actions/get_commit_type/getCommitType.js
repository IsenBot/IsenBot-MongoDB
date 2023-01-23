const fs = require('node:fs');
const core = require('@actions/core');

const message = core.getInput('commit-message');
core.info(message);
core.setOutput('type', 'patch');