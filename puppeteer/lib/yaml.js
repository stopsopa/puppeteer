
const yaml              = require('js-yaml');

const path              = require('path');

const fs                = require('fs');

module.exports = file => {

    try {

        return yaml.safeLoad(fs.readFileSync(file, 'utf8'));
    } catch (e) {

        console.log(`couldn't parse: ${file}, reason: \n`);

        console.log(e);

        // just stop everything right now

        process.exit(1);
    }
}