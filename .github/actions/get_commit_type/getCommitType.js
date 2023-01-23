const fs = require('node:fs');
const core = require('@actions/core');

const message = core.getInput('commit-message');
if(message.toLowerCase().contains("major") || message.toLowerCase().contains("breaking change")){
    core.setOutput('type', 'patch');
} else {
    if(message.toLowerCase().contains("minor") || message.toLowerCase().contains("feat")){
        core.setOutput('type', 'minor');
    } else {
        core.setOutput('type', 'patch');
    }
}