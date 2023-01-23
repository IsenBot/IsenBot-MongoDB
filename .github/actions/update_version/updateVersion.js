const fs = require('node:fs');
const core = require('@actions/core');
const exec = require('@actions/exec');

const type = core.getInput('type');

fs.readFile('./package.json', (e, data) => {
    if(e) {
        throw e;
    }
    const package = JSON.parse(data);
    const versionArray = package.version.split('.').map(version => parseInt(version, 10));
    let message;
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
    fs.writeFile('./package.json', JSON.stringify(package), () => {
        exec.exec('git config --global user.name "IsenBot Auto Versioning"');
        exec.exec('git config --global user.email "isenbot@isenbot.com"');
        exec.exec('git commit -a --message=\"' + message + package.version + '\"');
        exec.exec('git push origin main')
    })
})