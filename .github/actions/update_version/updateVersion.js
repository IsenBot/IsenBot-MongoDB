const fs = require('node:fs');
const core = require('@actions/core');
const exec = require('@actions/exec');

const typesArray = core.getInput('types');
const token = core.getInput('repo-token');

fs.readFile('./package.json', (e, data) => {
    if(e) {
        throw e;
    }
    const package = JSON.parse(data);
    const versionArray = package.version.split('.').map(version => parseInt(version, 10));
    let message;
    for(const type of typesArray){
        if(type === 'major'){
            versionArray[0] += 1;
            versionArray[1] = 0;
            versionArray[2] = 0;
            message = '📣 New MAJOR release 📣 ';
        }
        if(type === 'minor'){
            versionArray[1] += 1;
            versionArray[2] = 0;
            message = '🆕 New minor release 🆕 ';
        }
        if(type === 'patch'){
            versionArray[2] += 1;
            message = '✅ patch ';
        }
        package.version = versionArray.join('.');
        message = message + package.version + '\n';
    }
    
    fs.writeFile('./package.json', JSON.stringify(package), async () => {
        await exec.exec('git config --global user.name "IsenBot Auto Versioning"');
        await exec.exec('git config --global user.email "isenbot@isenbot.com"');
        await exec.exec('git commit -a --message=\"' + message + '\"');
        await exec.exec('git remote remove origin')
        await exec.exec(`git remote add origin https://${token}@github.com/allan-cff/IsenBot-GithubActions.git`);
        await exec.exec('git push origin main')
    })
})