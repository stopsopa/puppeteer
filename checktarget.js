
const path = require('path');

const config = require(path.resolve(__dirname, 'config'));

const t = process.env.TARGET;

if (typeof t !== 'string' || !t) {

    throw `TARGET environment variable invalid or unspecified, current value: '${t}', type: ${typeof t}`;
}

if ( ! config.servers[t] ) {

    throw `there is no config '${t}' pointed by TARGET environment variable`;
}

console.log('ENV:', JSON.stringify(
    {
        TARGET: process.env.TARGET || 'NOT SPECIFIED',
        ROOTDIR: process.env.ROOTDIR || 'NOT SPECIFIED'
    },
    null,
    4
))

module.exports = config.servers[t];

