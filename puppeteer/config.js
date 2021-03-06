
require('@stopsopa/dotenv-up')(2, false, 'puppeteer/config.js');

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
    waitToRunSeleniumCluster: 8, // sec
    curlTestMaxTime: 1, // sec

    // projectServer: host.server,

    rootdir: path.resolve(__dirname, '.'), // for page.resolve()
    servers: {
        default: { // host (for now just mac) machine
            schema: 'http',
            host: 'localhost',
            port: parseInt(process.env.NODE_PORT || 1028, 10),
        },
        travis: { // build http server and continue
            schema: 'http',
            host: 'localhost',
            port: parseInt(process.env.NODE_PORT || 1025, 10),
            runbefore: `/bin/bash ${path.resolve(__dirname, 'sandbox', 'run-sandbox-server.sh')}`, // optional parameter
        },
        docssh: { // host (for now just mac) machine
            schema: 'http',
            host: 'localhost', // puppeteer will request from docker container to this host
            port: parseInt(process.env.NODE_PORT || 1025, 10), // mount 1025 host port into docker to 1025 localhost port
            sshport: 2222, // container port 22 mounted on host port 2222 for ssh tunnel on 1025 port
            containername: 'puppeteer-docker',
            runbefore: `/bin/bash ${path.resolve(__dirname, 'docker', 'puppeteer-docker.sh')}`, // optional parameter
            workdir: '/var/app/runtime', // for page.resolve() in docker context
            getbrowser: async (puppeteer, config) => {
                return await puppeteer.connect({
                    browserWSEndpoint: 'ws://localhost:3000'
                });
            },
            getpage: async (browser, config) => {
                return await browser.pages().then(pages => pages[0]);
            },
        },
        dochost: { // host (for now just mac) machine
            schema: 'http',
            host: 'host', // puppeteer will request from docker container to this host
            port: parseInt(process.env.NODE_PORT || 1025, 10), // mount 1025 host port into docker to 1025 localhost port
            // sshport: 2222, // container port 22 mounted on host port 2222 for ssh tunnel on 1025 port
            containername: 'puppeteer-docker',
            runbefore: `/bin/bash ${path.resolve(__dirname, 'docker', 'puppeteer-docker.sh')}`, // optional parameter
            workdir: '/var/app/runtime', // for page.resolve() in docker context
            getbrowser: async (puppeteer, config) => {
                return await puppeteer.connect({
                    browserWSEndpoint: 'ws://localhost:3000'
                });
            },
            getpage: async (browser, config) => {
                return await browser.pages().then(pages => pages[0]);
            },
        },
    },
    testServer: { // yarn server - test server
        schema: 'http',
        host: 'localhost',
        port: parseInt(process.env.NODE_PORT || 1025, 10),
    },
    preparePage: page => {
        page.setViewport({
            width: config.width,
            height: config.height,
        });
    },
    mac: {
        //
        getIpOfInterface: ''
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
