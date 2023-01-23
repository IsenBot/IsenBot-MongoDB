const fs = require('node:fs');
const core = require('@actions/core');

const commits = core.getInput('commits');
const typesArray = [];
for(const commit of commits){
    if(commit.message.toLowerCase().includes("major") || commit.message.toLowerCase().includes("breaking change")){
        typesArray.push('major');
    } else {
        if(commit.message.toLowerCase().includes("minor") || commit.message.toLowerCase().includes("feat")){
            typesArray.push('minor');
        } else {
            typesArray.push('patch');
        }
    }
}
core.setOutput('types', typesArray);