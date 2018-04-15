
const path              = require('path');

// const host              = require('../react/hosts');

// const yaml              = require('./lib/yaml');

const log               = require('./lib/logn');

// const sf_parameters_yml = path.resolve(__dirname, '../php/app/config/parameters.yml');
//
// const sf_parameters     = yaml(sf_parameters_yml).parameters;
//
// const docker_local_yml  = path.resolve(__dirname, '../docker/docker-compose.local.yml');
//
// const docker_local      = yaml(docker_local_yml);

// log('TRAVIS')
// log.dump(TRAVIS)

const config = {
    timeout: 200000,
    width: 1920, // extends viewport
    height: 1080, // but for window limit is real screen size
    hub: {
        host: "localhost", // http://localhost:4445/grid/console?config=true&configDebug=true&refresh=10
        port: 4444
    },
    node: {
        host: "localhost",
        port: 5555,
    },
    browser: {
        browserName: 'chrome',
        platform: 'macOS 10.12', // java.lang.IllegalArgumentException: No enum constant org.openqa.selenium.Platform.macOS1012
        version: '65.0',
        maxInstances: '10'
    },
    waitToRunSeleniumCluster: 8, // sec
    curlTestMaxTime: 1, // sec


    // projectServer: host.server,

    projectServer: { // yarn server
        schema: 'http',
        host: 'localhost',
        port: 93,
    },

    testServer: { // yarn server
        schema: 'http',
        host: 'localhost',
        port: 1025
    },
    preparePage: page => {

        page.setViewport({
            width: config.width,
            height: config.height,
        });

    }

    // mysql: { // https://github.com/mysqljs/mysql#connection-options
    //     connectionLimit : 3,
    //     host     : '0.0.0.0',
    //     port     : docker_local.services.mysql.ports[0].split(':')[0],
    //     user     : sf_parameters.database_user,
    //     password : sf_parameters.database_password,
    //     database : sf_parameters.database_name,
    //     connectTimeout: 3000,
    //     table           : 'spark_cache'
    // }
};

config.launchOptions = {
    headless: false,
    args: [ // https://github.com/GoogleChrome/puppeteer/issues/1183#issuecomment-363569401
        `--window-size=${ config.width },${ config.height }`
    ]
};

if (process.env.TRAVIS) {

    // https://github.com/GoogleChrome/puppeteer/issues/290#issuecomment-322852784
        config.launchOptions.args.push('--no-sandbox');
        config.launchOptions.args.push('--disable-setuid-sandbox');
        config.launchOptions.headless = true;
//
//     config.node.port = 80;
//
//     config.testServer.schema    = 'https';
//     config.testServer.host      = 'stopsopa.github.io/state-of-selenium';
//     config.testServer.port      = 80;
}

module.exports = config;
