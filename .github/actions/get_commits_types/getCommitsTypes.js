const core = require('@actions/core');
const exec = require('@actions/exec');

const first = core.getInput('first');
const last = core.getInput('last');
const res = await exec.exec(`git diff ${first} ${last}`);
console.log(res);

const commits = [];
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