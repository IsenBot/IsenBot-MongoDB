const fs = require('node:fs');
const path = require('node:path');
const core = require('@actions/core')

const type = core.getInput('type');

core.info('Output to the actions build log')

core.notice('This is a message that will also emit an annotation')

core.notice(path.dirname);
core.notice(path.resolve('../../../'));

fs.readFile('../../../package.json', (e, data) => {
    if(e) {
        throw e;
    }
    const package = JSON.parse(data);
    const versionArray = package.version.split('.').map(version => parseInt(version, 10));
    if(type === 'major'){
        versionArray[0] += 1;
        versionArray[1] = 0;
        versionArray[2] = 0;
    }
    if(type === 'minor'){
        versionArray[1] += 1;
        versionArray[2] = 0;
    }
    if(type === 'patch'){
        versionArray[2] += 1;
    }
    package.version = versionArray.join('.');
    fs.writeFile('./package.json', JSON.stringify(package), ()=>{})
})