/**
 * node config.js --param hub.host
 */

const config = require('./config');

const log = console.log;

// // https://nodejs.org/docs/latest/api/all.html#modules_accessing_the_main_module
if (require.main === module) {

    function isObject(a) {
        return ['[object Object]',"[object Array]"].indexOf(Object.prototype.toString.call(a)) > -1;
    };

    const a = process.argv.slice(2);

    if (a.indexOf('--param') > -1) {

        const key = ( a[1] || '' ).split('.');

        let k, tmp = config;

        while (k = key.shift()) {

            tmp = tmp[k];
        }

        if (isObject(tmp)) {

            process.stdout.write(JSON.stringify(tmp, null, '    '));
        }
        else {

            process.stdout.write(tmp + '');
        }

    }

}
else {

    module.exports = config;
}