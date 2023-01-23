const fs = require('node:fs');
const core = require('@actions/core');

const message = core.getInput('commit-message');
if(message.toLowerCase().includes("major") || message.toLowerCase().includes("breaking change")){
    core.setOutput('type', 'patch');
} else {
    if(message.toLowerCase().includes("minor") || message.toLowerCase().includes("feat")){
        core.setOutput('type', 'minor');
    } else {
        core.setOutput('type', 'patch');
    }
}