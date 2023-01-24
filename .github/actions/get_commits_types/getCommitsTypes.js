const core = require('@actions/core');
const exec = require('@actions/exec');

const first = core.getInput('first-commit');
const last = core.getInput('last-commit');
console.log(first);
console.log(last);
const res = await exec.exec(`git log ${first}...${last}^ --pretty=format:'%s'`);
console.log(res);

const commits = res.split('\n');
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