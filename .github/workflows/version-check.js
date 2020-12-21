const currentVersion = require('../../package.json').version;
const core = require('@actions/core');
const fetch = require('node-fetch');
const url = 'https://raw.githubusercontent.com/hCaptcha/react-hcaptcha/master/package.json';
fetch(url, {method: 'GET'})
    .then(res => res.json())
    .then((json) => {
        const masterVersion = json.version;
        console.log({currentVersion, masterVersion});
        if (currentVersion === masterVersion) {
            core.setFailed(`Version must be different than one on master. Master: ${masterVersion}, Current: ${currentVersion}`);
        }
    });
