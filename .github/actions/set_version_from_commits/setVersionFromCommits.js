const core = require('@actions/core');
const exec = require('@actions/exec');
const fs = require('node:fs');

const first = core.getInput('first-commit');
const last = core.getInput('last-commit');
const token = core.getInput('repo-token');

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

exec.exec(`git log ${last}...${first} --pretty=format:'%s'`).then(() => {
    fs.readFile('./package.json', (e, data) => {
        if(e) {
            throw e;
        }
        const package = JSON.parse(data);
        console.log(myOutput);
        console.log(typeof myOutput);
        const versionArray = package.version.split('.').map(version => parseInt(version, 10));
        const commits = myOutput.split('\n');
        let message = '"';
        console.log(commits);
        for(const commit of commits){
            console.log(typeof commit);
            let messageType = "";
            if(commit.toLowerCase().includes("major") || commit.toLowerCase().includes("breaking change")){
                versionArray[0] += 1;
                versionArray[1] = 0;
                versionArray[2] = 0;
                messageType = '📣 New MAJOR release 📣 ';
                console.log(commit + "is major update");
            } else {
                if(commit.toLowerCase().includes("minor") || commit.toLowerCase().includes("feat")){
                    versionArray[1] += 1;
                    versionArray[2] = 0;
                    messageType = '🆕 New minor release 🆕 ';
                    console.log(commit + "is minor update");
                } else {
                    versionArray[2] += 1;
                    messageType = '✅ patch ';
                    console.log(commit + "is patch update");
                }
            }
            message = '-' + messageType + versionArray.join('.') + '\n' + commit + '\n';
        }
        package.version = versionArray.join('.');        
        message = '🚨 New version : ' + package.version + '\n' + message + '"';
        fs.writeFile('./package.json', JSON.stringify(package), async () => {
            await exec.exec('git config --global user.name "IsenBot Auto Versioning"');
            await exec.exec('git config --global user.email "isenbot@isenbot.com"');
            await exec.exec('git commit -a --message=\"' + message + '\"');
            await exec.exec('git remote remove origin')
            await exec.exec(`git remote add origin https://${token}@github.com/allan-cff/IsenBot-GithubActions.git`);
            await exec.exec('git push origin main')
        })
    })
})