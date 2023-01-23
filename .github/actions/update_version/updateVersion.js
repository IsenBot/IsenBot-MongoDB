const fs = require('node:fs');

fs.readFile('../../../package.json', (e, data) => {
    if(e) {
        throw e;
    }
    const package = JSON.parse(data);
    const versionArray = package.version.split('.').map(version => parseInt(version, 10));
    if(process.argv.some(elem => elem.includes('major'))){
        versionArray[0] += 1;
        versionArray[1] = 0;
        versionArray[2] = 0;
    }
    if(process.argv.some(elem => elem.includes('minor'))){
        versionArray[1] += 1;
        versionArray[2] = 0;
    }
    if(process.argv.some(elem => elem.includes('patch'))){
        versionArray[2] += 1;
    }
    package.version = versionArray.join('.');
    fs.writeFile('./package.json', JSON.stringify(package), ()=>{})
})