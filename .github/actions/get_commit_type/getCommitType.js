const fs = require('node:fs');
const core = require('@actions/core');

const message = core.getInput('commit-message');
if(message.toLowerString().contains("major") || message.toLowerString().contains("breaking change")){
    core.setOutput('type', 'patch');
} else {
    if(message.toLowerString().contains("minor") || message.toLowerString().contains("feat")){
        core.setOutput('type', 'minor');
    } else {
        core.setOutput('type', 'patch');
    }
}