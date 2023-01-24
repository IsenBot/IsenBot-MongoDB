const core = require('@actions/core');
const exec = require('@actions/exec');

const first = core.getInput('first-commit');
const last = core.getInput('last-commit');

let myOutput = '';
let myError = '';
const options = {};

options.listeners = {
  stdout: (data) => {
    myOutput += data.toString();
  },
  stderr: (data) => {
    myError += data.toString();
  }
};
options.cwd = './lib';

exec.exec(`git log ${first}...${last}^ --pretty=format:'%s'`).then(() => {
    console.log(myOutput);
    const commits = myOutput.split('\n');
    const typesArray = [];
    for(const commit of commits){
        if(commit.toLowerCase().includes("major") || commit.toLowerCase().includes("breaking change")){
            typesArray.push('major');
        } else {
            if(commit.toLowerCase().includes("minor") || commit.toLowerCase().includes("feat")){
                typesArray.push('minor');
            } else {
                typesArray.push('patch');
            }
        }
    }
    core.setOutput('types', typesArray);
})