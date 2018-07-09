
const path = require('path');

const fs = require('fs');

const puppeteer = require('puppeteer');

const stringify = require('json-stable-stringify');

const log = require('./lib/logn');

const config = require(path.resolve(__dirname, 'config'));

function isObject(a) {
    return (!!a) && (a.constructor === Object); // see the difference between object and array
    // return Object.prototype.toString.call(a) === '[object Object]'; // better in node.js to dealing with RowDataPacket object
    // return ['[object Object]',"[object Array]"].indexOf(Object.prototype.toString.call(a)) > -1;
};

config.timeout && jest.setTimeout(config.timeout);

/**
 * https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#puppeteerlaunchoptions
 *
 * @param options - bool || object || function (default undefined)
 *      undefined - empty object as an argument (no options)
 *      true - default config.launchOptions
 *      object - own config
 *      function - mix (in first arg you receive config.launchOptions)
 *          do whatever you want to generate new options
 */
module.exports = async options => {

    let browser;

    const def = Object.assign({}, config.launchOptions || {});

    if (options === true) {

        browser = await puppeteer.launch(def);
    }

    if (typeof options === 'undefined') {

        browser = await puppeteer.launch();
    }

    if (isObject(options)) {

        browser = await puppeteer.launch(options);
    }

    if (typeof options === 'function') {

        browser = await puppeteer.launch(options(def));
    }

    /**
     * @param prepare function|bool (default: undefined)
     *      - undefined - no preparation
     *      - true - use default prepare from config.js
     *      - function - own preparation
     *
     *      function (page, config.preparePage) {
     *          // second arg is always function (can be noop)
     *
     *          page.doMyStuff()
     *
     *          preparePage(page)
     *      }
     */
    browser.page = async (prepare, handleLaterThisArgumentToDecideIfCreateAndReturnNewTab) => {

        const page = await browser.pages().then(pages => pages[0]);

        if (prepare) {

            if (typeof prepare === 'function') {

                prepare(page, config.preparePage || (() => {}));
            }
            else if (config.preparePage) {

                config.preparePage(page);
            }
        }

        page.sleep = ms => new Promise(res => setTimeout(res, ms));

        page.sleepSec = sec => page.sleep(sec * 1000);

        page.json = data => stringify(data)

        page.log = (...args) => log.stack(2).log(...args, "\n");

        page.dump = (...args) => log.stack(3).dump(...args, "\n");

        (function (old) {
            page.get = (...args) => {

                process.stdout.write('page.get: ' + args[0] + "\n");

                return old.apply(page, args);
            }
            page.getServerTest = (path, ...rest) => {

                if (/^(https?|file):\/\//.test(path)) {

                    process.stdout.write('getServerTest old: ' + path + "\n");

                    return old.apply(page, [path, ...rest]);
                }

                let url = `${config.testServer.schema}://${config.testServer.host}`;

                if (config.testServer.port != 80) {

                    url += ':' + config.testServer.port;
                }

                url += path;

                process.stdout.write('getServerTest === : ' + url + "\n");

                return old.apply(page, [url, ...rest]);
            }
            page.getServerEnv = (_path, ...rest) => {

                const c = require(path.resolve(__dirname, 'checktarget.js'));

                const t = process.env.TARGET;

                if (/^(https?|file):\/\//.test(_path)) {

                    process.stdout.write(`getServerEnv ${t}: ` + _path + "\n");

                    return old.apply(page, [_path, ...rest]);
                }

                let url = `${c.schema}://${c.host}`;

                if (c.port != 80) {

                    url += ':' + c.port;
                }

                url += _path;

                process.stdout.write(`getServerEnv ${t}: ` + url + "\n");

                return old.apply(page, [url, ...rest]);
            }
        }(page.goto));


        page.waitForCustomEvent = (function () {

            let cache;

            const getSeleniumLib = () => {

                if ( ! cache ) {

                    cache = fs.readFileSync(path.resolve(__dirname, 'lib/selenium.min.js')).toString();
                }

                return cache;
            }

            /**
             * requirement - function || bool[works like multiple flag] (def, undefined)
             * await driver.waitForCustomEvent('mainRequest:material-list', (data, curlang) => {
                    return data && data.supportSelectedLanguage == curlang
               }, curlang)
             */
            return (name, requirement, dataForRequirement) => {

                if ( typeof name !== 'string' || ! name ) {

                    throw `waitForCustomEvent: name should be non empty string`;
                }

                if (typeof requirement === 'undefined') {

                    requirement = false;
                }

                const promise = page.evaluate(
                    json => {
                        eval(json.seleniumplugin);
                        eval('var requirement=' + json.requirement);
                        delete json.seleniumplugin;
                        return new Promise((res, rej) => {
                            selenium.subscribe(
                                json.name,
                                (typeof requirement === 'function') ?
                                    data => {
                                        if (requirement(data, json.dataForRequirement)){
                                            res(data)
                                        }
                                    }:res,
                                // data => cb({
                                //     data:data,
                                //     json: json
                                // }),
                                !!requirement
                            )
                        });
                    },
                    {
                        name,
                        seleniumplugin: getSeleniumLib(),
                        requirement: requirement.toString(),
                        dataForRequirement,
                    }
                );

                promise.catch(e => {
                    process.stdout.write('waitForCustomEvent: ' + "\n");
                    log.dump(e)
                })

                return promise;
            };
        }());

        /**
         *
         const agent = await page.waitForJs(() => new Promise(resolve => {

                var inter = setInterval(() => {

                    const agent = navigator.userAgent;

                    if (agent) {

                        clearInterval(inter);

                        resolve(agent);
                    }

                }, 200);

             }));
         */
        page.waitForJs = (fn, data, interval = 300, init) => {

            if (interval < 3) {

                throw `waitForJs: 'interval' should be bigger then 3 ms`
            }

            if (['function', 'string'].indexOf(typeof fn) === -1) {

                throw `waitForJs: 'fn' should be bigger function or strings`;
            }

            const opt = {
                fn      : fn.toString(),
                interval,
                data
            };

            if (typeof init === 'function') {

                opt.init    = init.toString();
            }

            if (typeof fn === 'string') {

                try {

                    eval('const tmp = ' + fn);

                    fn = tmp;
                }
                catch (e) {

                    throw `waitForJs:outside evaluation 'fn' parameter from string to function failed`;
                }
            }

            if (typeof fn !== 'function') {

                throw `waitForJs:outside 'fn' after evaluation is not function`;
            }

            /**
             * https://skalman.github.io/UglifyJS-online/
             */
            const promise = page.evaluate(
                // implementation for testing
                json => new Promise((res, rej) => {

                    // logInBrowser('executed');

                    var carry = {};

                    eval('var fn = ' + json.fn);

                    if (typeof fn !== 'function') {

                        return rej({
                            __origin__      : 'waitForJs:eval:fn',
                            string          : `'fn' after evaluation is not function`
                        });
                    }

                    if (json.init) {

                        eval('var _init = ' + json.init);

                        if (typeof _init !== 'function') {

                            return rej({
                                __origin__      : 'waitForJs:eval:_init',
                                string          : `'_init' after evaluation is not function`
                            });
                        }

                        // logInBrowser('init');

                        _init(carry);
                    }

                    var handler, tmp;

                    function test() {

                        // logInBrowser(JSON.stringify(json.data))

                        let result;

                        try {

                            result = fn(json.data, carry);
                        }
                        catch (e) {

                            clearInterval(handler);

                            return rej({
                                __origin__      : 'waitForJs:general',
                                string          : e.toString(),
                                fileName        : e.fileName,
                                stack           : e.stack,
                                columnNumber    : e.columnNumber
                            })
                        }

                        if (result) {

                            clearInterval(handler);

                            res(result);
                        }
                    };

                    handler = setInterval(test, json.interval);

                    test();
                }),
                opt
            )
                .then(result => {

                    if ( result && result.__origin__ && result.__origin__.indexOf('waitForJs:') === 0 ) {

                        return Promise.reject(result);
                    }

                    return result;
                });

            promise.catch(e => {
                process.stdout.write('waitForCustomEvent: ' + "\n");
                log.dump(e)
            })

            return promise;
        };

        (function (old) {

            page.waitForNavigation = async opt => {

                if (typeof opt === 'undefined') {

                    opt = {
                        waitUntil: 'load',
                    }
                }

                await old.call(page, opt);

                await page.sleepSec(0.3);

            }

        }(page.waitForNavigation));

        /**
         * Logic based on implementation of page.$

         const option = await page.waitForElement(() => document.querySelector('[data-test="change-language"] option'));
         */
        page.waitForElement = async (fn, interval = 300, data) => {
            try {

                if (typeof fn === 'string') {

                    let b = '"'

                    if (fn.indexOf('"') > -1) {

                        b = "'";
                    }

                    fn = Function(`return document.querySelector(${b}${fn}${b})`);
                }

                const handle = await page.evaluateHandle(data => new Promise((res, rej) => {

                    try {
                        var fn = eval('(' + data.fn + ')');
                    }
                    catch (e) {

                        return rej(JSON.stringify({
                            message: `waitForElement inside: eval failed`,
                            data
                        }, null, '    '));
                    }

                    if (typeof fn !== 'function') {

                        return rej(JSON.stringify({
                            message: `waitForElement inside: fn is not a function after eval`,
                            data
                        }, null, '    '));
                    }

                    var t, int;

                    const test = () => {

                        t = fn(data.data);

                        if (t) {

                            clearInterval(int);

                            res(t)
                        }
                    };

                    int = setInterval(test, data.interval);

                    test();

                }), {
                    fn: fn.toString(),
                    interval,
                    data
                });

                const element = handle.asElement();

                if (element) {

                    return element;
                }

                await handle.dispose();

                return null;
            }
            catch (e) {

                throw "waitForElements: lost javascript context - page was redirected. \n    original error: " +  e.message;
            }
        }
        // page.waitForElement = async (fn, interval = 300, ...rest) => {
        //
        //     try {
        //
        //         if (typeof fn === 'string') {
        //
        //             let b = '"'
        //
        //             if (fn.indexOf('"') > -1) {
        //
        //                 b = "'";
        //             }
        //
        //             fn = Function(`return document.querySelector(${b}${fn}${b})`);
        //         }
        //
        //         await page.waitForFunction(fn, {
        //             polling: interval
        //         }, ...rest);
        //
        //         const handle = await page.evaluateHandle(fn, ...rest);
        //
        //         if (handle && handle.asElement) {
        //
        //             log.dump('wlazł')
        //
        //             const element = handle.asElement();
        //             log.dump(element)
        //
        //             if (element) {
        //
        //                 return element;
        //             }
        //         }
        //         else {
        //             log.dump('something ele')
        //         }
        //
        //         // await page.sleep(interval);
        //
        //         // for (;;) {
        //         //
        //         //     log("\n\nlet's try...\n\n")
        //         //
        //         //     try {
        //         //
        //         //         const handle = await page.evaluateHandle(fn, data);
        //         //
        //         //         if (handle && handle.asElement) {
        //         //
        //         //             log.dump('wlazł')
        //         //
        //         //             const element = handle.asElement();
        //         //             log.dump(element)
        //         //
        //         //             if (element) {
        //         //
        //         //                 return element;
        //         //             }
        //         //         }
        //         //         else {
        //         //             log.dump('something ele')
        //         //         }
        //         //
        //         //         await page.sleep(interval);
        //         //
        //         //         // await handle.dispose();
        //         //         //
        //         //         // return null;
        //         //     }
        //         //     catch (e) {
        //         //
        //         //         log.dump("\n\ncatch error...\n\n")
        //         //         log.dump(e)
        //         //         // throw e;
        //         //     }
        //         //
        //         // }
        //     }
        //     catch (e) {
        //
        //         log.dump("\n\n\n\n");
        //
        //         log.dump(e);
        //     }
        // };

        /**
         * Logic based on implementation of page.$$
         */
        page.waitForElements = async (fn, interval = 300, data) => {

            try {

                if (typeof fn === 'string') {

                    let b = '"'

                    if (fn.indexOf('"') > -1) {

                        b = "'";
                    }

                    fn = Function(`return document.querySelectorAll(${b}${fn}${b})`);
                }

                const arrayHandle = await page.evaluateHandle(data => new Promise((res, rej) => {

                    try {
                        var fn = eval('(' + data.fn + ')');
                    }
                    catch (e) {

                        return rej(JSON.stringify({
                            message: `waitForElements inside: eval failed`,
                            data
                        }, null, '    '));
                    }

                    if (typeof fn !== 'function') {

                        return rej(JSON.stringify({
                            message: `waitForElements inside: fn is not a function after eval`,
                            data
                        }, null, '    '));
                    }

                    var t, int;

                    const test = () => {

                        t = fn(data.data);

                        if (t) {

                            clearInterval(int);

                            res(t)
                        }
                    };

                    int = setInterval(test, data.interval);

                    test();

                }), {
                    fn: fn.toString(),
                    interval,
                    data
                });

                // async $$(selector) {
                //     const arrayHandle = await this.executionContext().evaluateHandle(
                //         (element, selector) => element.querySelectorAll(selector),
                //         this, selector
                //     );
                //     const properties = await arrayHandle.getProperties();
                //     await arrayHandle.dispose();
                //     const result = [];
                //     for (const property of properties.values()) {
                //         const elementHandle = property.asElement();
                //         if (elementHandle)
                //             result.push(elementHandle);
                //     }
                //     return result;
                // }

                const properties = await arrayHandle.getProperties();
                await arrayHandle.dispose();
                const result = [];
                for (const property of properties.values()) {
                    const elementHandle = property.asElement();
                    if (elementHandle)
                        result.push(elementHandle);
                }
                return result;
            }
            catch (e) {

                throw "waitForElements: lost javascript context - page was redirected. \n    original error: " +  e.message;
            }
        }
        // function scrollTo(element, to, duration) {
        //     if (duration <= 0) return;
        //     var difference = to - element.scrollTop;
        //     var perTick = difference / duration * 10;
        //
        //     setTimeout(function() {
        //         element.scrollTop = element.scrollTop + perTick;
        //         if (element.scrollTop === to) return;
        //         scrollTo(element, to, duration - 10);
        //     }, 10);
        // }
        page.scrollTo = y => page.evaluate(y => {
            document.body.scrollTop = document.documentElement.scrollTop = y;
            return true;
        }, y)

        page.getStatus = () => page.evaluate(() => window.responsestatuscode);

        page.testStatus = async (status = 200) => {

            expect(await page.getStatus()).toBe(status);

            return page;
        }

        page.getPathname = () => page.evaluate(() => location.pathname + location.search);

        return page;
    }


    return browser;
}


// https://wiki.saucelabs.com/display/DOCS/Platform+Configurator#/
// caps = {};
// caps['browserName'] = 'chrome';
// caps['platform'] = 'Windows 10';
// caps['version'] = '65.0';

// from : http://seleniumhq.github.io/selenium/docs/api/javascript/
// and above is from: https://github.com/SeleniumHQ/selenium

// explore code :
// https://github.com/SeleniumHQ/selenium/tree/master/javascript/node/selenium-webdriver
// auto generated doc:
// http://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index.html

// const path = require('path');
//
// const fs = require('fs');
//
// const stringify = require('json-stable-stringify');
//
// const log = require(path.resolve(__dirname, '.', 'lib', 'logn'));
//
//
// // console.log(typeof require('selenium-webdriver'));
// // process.exit(0);
//
// // require(path.resolve(__dirname, '..', 'lib', 'rootrequire'))(__dirname, '..');
//
// const {Builder, By, Key, until, promise, Browser, Platform, Capabilities } = require('selenium-webdriver');
// const chrome    = require('selenium-webdriver/chrome');
// const Options   = chrome.Options;
// // const edge      = require('selenium-webdriver/edge');
// // const firefox   = require('selenium-webdriver/firefox');
//
// // const wait = (sec = 1) => new Promise(r => {const ms = parseInt(sec * 1000); setTimeout(r, ms, 'resolved: wait ' + sec + ' sec')});
//
// const config = require(path.resolve('.', 'config'));
//
// let endpoint;
//
// if (process.env.TRAVIS) {
//
//     /**
//      * https://docs.travis-ci.com/user/sauce-connect/#Setting-up-Sauce-Connect
//      * https://github.com/samccone/travis-sauce-connect/blob/master/test/basic.js
//      */
//     endpoint = 'http://'+ process.env.SAUCE_USERNAME+':'+process.env.SAUCE_ACCESS_KEY+'@ondemand.saucelabs.com:80/wd/hub';
// }
// else {
//
//     endpoint = `http://${config.node.host}:${config.node.port}/wd/hub`;
// }
//
// const time = () => (new Date()).toISOString().substring(0, 19).replace('T', ' ');
//
// module.exports = (async function () {
//
//     jest.setTimeout(20000); // this works (1)
//
//     function unique(pattern) { // node.js require('crypto').randomBytes(16).toString('hex');
//         pattern || (pattern = 'xyxyxy');
//         return pattern.replace(/[xy]/g,
//             function(c) {
//                 var r = Math.random() * 16 | 0,
//                     v = c == 'x' ? r : (r & 0x3 | 0x8);
//                 return v.toString(16);
//             });
//     }
//
//     let driver = await new Promise((resolve, reject) => {
//
//         const un = unique() + ' ';
//
//         const handler = setTimeout(reject, 15000, "\n\n" + un + time() + ' - creating driver timeout' + "\n\n");
//
//         (async function tryagain() {
//
//             process.stdout.write("\n\n" + un + time() + ` - attempt to create driver:` + "\n\n");
//
//             let driver;
//
//             try {
//
//                 let browserName     = config.browser.browserName;
//
//                 let platform        = config.browser.platform;
//
//                 let version         = config.browser.version;
//
//                 if (process.env.BROWSER) {
//
//                     browserName = process.env.BROWSER;
//                 }
//
//                 if (process.env.PLATFORM) {
//
//                     platform = process.env.PLATFORM;
//                 }
//
//                 if (process.env.VERSION) {
//
//                     version = process.env.VERSION;
//                 }
//
//                 /**
//                  * https://saucelabs.com/platforms
//                  * https://wiki.saucelabs.com/display/DOCS/Platform+Configurator#/ g(Platform Configurator)
//                  * https://wiki.saucelabs.com/display/DOCS/Node.js+Test+Setup+Example
//                  * caps = {};
//                  caps['browserName'] = 'chrome';
//                  caps['platform'] = 'Windows 10';
//                  caps['version'] = '65.0';
//
//
//                  caps['browserName'] = 'chrome';
//                  caps['platform'] = 'macOS 10.12';
//                  caps['version'] = '65.0';
//                  */
//                 driver = await new Builder()
//                     .usingServer(endpoint) //  to check go to : http://localhost:4444/grid/console?config=true&configDebug=true&refresh=10
//                     .forBrowser(browserName, version, platform) // local instance of node don't care about platform & version, but saucelabs do
//                     // .forBrowser(Browser.CHROME)
//                     .withCapabilities({
//                         'browserName': browserName,
//                         'platform': platform,
//                         'version': version,
//                     })
//                     .setChromeOptions(
//                         new chrome
//                             .Options()
//                         // .headless()
//                             .windowSize({
//                                 width: config.width,
//                                 height: config.height
//                             })
//                             // https://youtu.be/NoRYn6gOtVo?t=30m41s
//                             // .addArguments('--incognito')
//                             // .addArguments('--start-maximized')
//
//                         // available devices, source code of chromium project
//                         // current version: https://chromium.googlesource.com/chromium/src/+/master/third_party/WebKit/Source/devtools/front_end/emulated_devices/module.json
//                         // older version: https://chromium.googlesource.com/chromium/src/+/ba858f4acbb01a224f03c5c19b392b94aae0ef91/third_party/WebKit/Source/devtools/front_end/toolbox/OverridesUI.js
//                         // new Options().setMobileEmulation({deviceName: "iPhone 6"}) // from 4 up to 6
//                     )
//                     // .setFirefoxOptions(
//                     //     new firefox
//                     //         .Options()
//                     //     //.headless()
//                     //         .windowSize({config.width, config.height})
//                     // )
//                     // .setChromeService(
//                     //     new chrome.ServiceBuilder()
//                     //         .enableVerboseLogging()
//                     //         .setStdio('inherit'))
//                     // .setEdgeService(
//                     //     process.platform === 'win32'
//                     //         ? new edge.ServiceBuilder()
//                     //             .enableVerboseLogging()
//                     //             .setStdio('inherit')
//                     //         : null)
//                     // .setFirefoxService(
//                     //     new firefox.ServiceBuilder()
//                     //         .enableVerboseLogging()
//                     //         .setStdio('inherit'))
//                     .build().catch(err => {
//                         log.dump(err)
//                     })
//                 ;
//
//                 process.stdout.write(`\n\n\n`+un + time() + ' - after creating driver' + "\n\n");
//
//                 // log("\n-".repeat(20))
//                 // log.dump(typeof driver);
//
//                 // // await driver.get('http://www.google.com/ncr');
//                 // //
//                 // // await driver.findElement(By.name('q')).sendKeys('webdriver', Key.RETURN);
//                 // //
//                 // // await driver.wait(until.titleIs('webdriver - Google Search'), 1000);
//                 // //
//                 // // await promise.delayed(2000);
//                 // // const sec = await wait(10).catch(e => log('err', e));
//                 //
//                 // await driver.get('https://stopsopa.github.io/research-protractor/e2e/ng.html');
//                 //
//                 //
//                 // let button = await driver.findElement(By.id('go'));
//                 //
//                 // let div = await driver.findElement(By.css('div'));
//                 //
//                 // // await driver.actions({bridge: true}).click(button).perform(); // more complicated way
//                 //
//                 // await button.click();
//                 //
//                 // const html = await div.getText();
//                 //
//                 // await promise.delayed(2000);
//                 //
//                 // console.log('test 1', html === 'clicked' ? 'true' : 'false')
//
//
//             } catch (e) {
//                 log('e'.repeat(1000))
//                 log.dump(e)
//                 log.dump(e.message)
//
//                 return setTimeout(tryagain, 1000);
//             }
//             // finally {
//
//                 // const timeout = 20000;
//                 //
//                 // setTimeout(async () => {
//                 //
//                 //     log('stop after fix aboumt of time: ' + timeout);
//                 //
//                 //     await driver.quit();
//                 //
//                 // }, timeout)
//             // }
//
//             if ( driver ) {
//
//                 process.stdout.write(`\n\n\n`+un + time() + ` - driver created...\n` + "\n\n")
//
//                 clearTimeout(handler);
//
//                 return resolve(driver);
//             }
//
//             process.stdout.write(un + time() + ' - driver.js: driver object was not created ...' + "\n\n");
//             process.stdout.write(typeof driver);
//             process.stdout.write("\n\n");
//
//             // reject(null);
//             setTimeout(tryagain, 1000);
//         })();
//
//     });
//
//     driver.config = config;
//
//     /**
//      * This method seems to provide page after DOMContentLoaded was triggered.
//      *
//      * documentation of driver.get says:
//      *
//      *      "A promise that will be resolved when the document has finished loading"
//      *
//      *      from :
//      *          http://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html#get
//      *          https://imgur.com/ANmE9wb
//      *
//      *      to test run:
//      *
//      *          await driver.getServerTest('/003-own-js-check-async/index.html');
//      *
//      *          let div = await driver.findElement(By.js(() => {
//      *              return document.querySelector('#DOMContentLoaded');
//      *          }));
//      *
//      expect(await div.getText()).toBe('test dom');
//      * @param path
//      * @param rest
//      * @returns {*}
//      */
//     (function (old) {
//         driver.get = (...args) => {
//
//             process.stdout.write('driver.get: ' + args[0] + "\n");
//
//             return old.apply(driver, args);
//         }
//         driver.getServerTest = (path, ...rest) => {
//
//             if (/^https?:\/\//.test(path)) {
//
//                 process.stdout.write('getServerTest old: ' + path + "\n");
//
//                 return old.apply(driver, [path, ...rest]);
//             }
//
//             let url = `${config.testServer.schema}://${config.testServer.host}`;
//
//             if (config.testServer.port != 80) {
//
//                 url += ':' + config.testServer.port;
//             }
//
//             url += path;
//
//             process.stdout.write('getServerTest: ' + url + "\n");
//
//             return old.apply(driver, [url, ...rest]);
//         }
//     }(driver.get));
//
//
//     driver.waitInterval = (condition, timeout = 10000, interval = 1000, message = undefined) => new Promise((resolve, reject) => {
//
//         timeout = parseInt(timeout, 10);
//
//         if (timeout < 1) {
//
//             throw "waitInterval: timeout should be bigger then 1"
//         }
//
//         let
//             inthan,
//             resolved = false,
//             timeoutHandler = (e, name) => {
//
//                 resolved = true;
//
//                 clearInterval(inthan);
//
//                 reject(e || {
//                     name: name || "TimeoutError",
//                     remoteStacktrace: "",
//                     origin: 'driver.waitInterval'
//                 });
//
//             }
//         ;
//
//         inthan = setTimeout(timeoutHandler, timeout);
//
//         (function again() {
//
//             if ( ! resolved ) {
//
//                 driver.wait(condition, 1, message)
//                     .then(
//                         resolve,
//                         e => {
//
//                             if (e.name === 'TimeoutError') {
//
//                                 return setTimeout(again, interval);
//                             }
//
//                             timeoutHandler(e, 'Other error, NOT TimeoutError')
//                         }
//                     )
//                 ;
//             }
//
//         }());
//     });
//
//     driver.getStatus = () => driver.executeScript(function () {
//         return window.responsestatuscode;
//     });
//
//     driver.testStatus = async (status = 200) => {
//
//         expect(await driver.getStatus()).toBe(status);
//
//         return driver;
//     }
//
//
//
//     /**
//      * <Dropdown data-test="categories" />
//      */
//     driver.semanticOption = async (selectorToDropdown, value) => {
//
//         const categorySelect = await driver.waitForElement(selectorToDropdown);
//
//         await categorySelect.click();
//
//         const categorySelectInput = await driver.waitForElement(`${selectorToDropdown} input`);
//
//         await categorySelectInput.sendKeys(value);
//
//         await driver.sleepSec(0.1);
//
//         await categorySelectInput.sendKeys(Key.ENTER);
//     }
//
//
//
//
//
//
//     driver.json = data => stringify(data)
//
//     driver.sleep = ms => promise.delayed(ms)
//
//     driver.sleepSec = sec => promise.delayed(Math.ceil(sec * 1000));
//
//     return driver;
// })();

