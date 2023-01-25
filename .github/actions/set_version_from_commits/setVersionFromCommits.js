const core = require('@actions/core');
const exec = require('@actions/exec');
const fs = require('node:fs');

const first = core.getInput('first-commit');
const last = core.getInput('last-commit');
const token = core.getInput('repo-token');

let gitOutput = '';
let gitError = '';
const options = {};

options.listeners = {
  stdout: (data) => {
    myOutput += data.toString();
  },
  stderr: (data) => {
    myError += data.toString();
  }
};

exec.exec(`git log ${last}...${first} --pretty=format:'%s'`, [], options).then(() => {
    if(gitError !== ''){
        core.error(gitError);
    }
    fs.readFile('./package.json', (e, data) => {
        if(e) {
            throw e;
        }
        const package = JSON.parse(data);
        const versionArray = package.version.split('.').map(version => parseInt(version, 10));
        const commitsMessages = gitOutput.split('\n');
        let message = '';
        let upgradeCommitsNumber = 0;
        for(let i = commitsMessages.length - 1; i >= 0; i--){
            let commit = commitsMessages[i];
            let messageType = "";
            if(!commit.toLowerCase().includes("[no-upgrade]") && !commit.toLowerCase().includes("[no-version]")){
                if(commit.toLowerCase().includes("major") || commit.toLowerCase().includes("breaking change")){
                    versionArray[0] += 1;
                    versionArray[1] = 0;
                    versionArray[2] = 0;
                    messageType = '📣 New MAJOR release 📣 ';
                } else {
                    if(commit.toLowerCase().includes("minor") || commit.toLowerCase().includes("feat")){
                        versionArray[1] += 1;
                        versionArray[2] = 0;
                        messageType = '🆕 New minor release 🆕 ';
                    } else {
                        versionArray[2] += 1;
                        messageType = '✅ patch ';
                    }
                }
                upgradeCommitsNumber++;
                message += '-' + messageType + versionArray.join('.') + '\n' + commit + '\n';
            }
        }
        if(upgradeCommitsNumber > 0){
            package.version = versionArray.join('.');        
            message = '🚨 New version : ' + package.version + '\n' + message;
            fs.writeFile('./package.json', JSON.stringify(package), async () => {
                await exec.exec('git config --global user.name "IsenBot Auto Versioning"');
                await exec.exec('git config --global user.email "isenbot@isenbot.com"');
                await exec.exec('git commit -a --message=\"' + message + '\"');
                await exec.exec('git remote remove origin')
                await exec.exec(`git remote add origin https://${token}@github.com/allan-cff/IsenBot-GithubActions.git`);
                await exec.exec('git push origin main')
            })
        }
    })
})