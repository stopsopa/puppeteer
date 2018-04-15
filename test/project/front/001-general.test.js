
const path = require('path');

const fs = require('fs');

const { By, promise, until, Key } = require('selenium-webdriver');

const log = require('../../../lib/logn');

describe('dbnochange ng-calc', async () => {

    let driver;

    beforeAll(async () => {

        driver = await require(path.resolve(__dirname, '..', '..', '..', 'driver.js'));
    });

    afterAll(async () => {

        await driver.quit();
    });

    test('dbnochange homepage redirection', async () => {

        await driver.getProjectServer('');

        await driver.testStatus();

        const pathname = await driver.getPathname();

        expect(pathname).toBe('/about/know-aml');

    }, 6000);

    test('dbnochange go directly to /about/know-aml', async () => {

        await driver.getProjectServer('/about/know-aml');

        await driver.testStatus();

        const pathname = await driver.getPathname();

        expect(pathname).toBe('/about/know-aml');

    }, 6000);

    test('dbnochange twitter button', async () => {

        await driver.getProjectServer('/awareness-day/about-the-day');

        await driver.testStatus();

        let button = await driver.waitForElement('.tweet__btn', 1000);

        expect(await button.getText()).toBe('Tweet');

        // await button.click();

        // open in new tab:
        //      https://twitter.com/login?redirect_after_login=%2Fhome%3Fstatus%3DThis%2520is%2520the%2520tweet%2520message%2520%2523TestHash

        // a href of button
        //      https://twitter.com/home?status=This%20is%20the%20tweet%20message%20%23TestHash
        const url = await button.getAttribute('href');

        expect(url.indexOf('https://twitter.com/home?status=') === 0).toBeTruthy();

    }, 6000);

    describe('dbnochange support', async () => {

        test('dbnochange init load count', async () => {

            await driver.getProjectServer('/carers/support');

            await driver.testStatus();

            await driver.waitForJs(() => {

                const value = document.querySelectorAll('.card-support-group').length;

                if (value > 1) {

                    return value;
                }
            });

        }, 16000);

        test('dbnochange change select and wait for event', async () => {

            let tmp;
            try {

                const option = await driver.waitForElement(() => {

                    const list = Array.prototype.slice.call(document.querySelectorAll('[data-test="change-country"] option'));

                    if (list.length > 1) {

                        const first = list.find(e => e.value);

                        if (first) {

                            return first;
                        }
                    }

                    return null;
                }, 1000);

                await option.click();

                tmp = await driver.waitForCustomEvent('mainRequest:global-supportgroups');

                expect(tmp.supportSelectedCountry.length).toBeGreaterThan(0);

                tmp = await driver.waitForCustomEvent('mainSuccess:global-supportgroups');

                expect(tmp.len).toBeGreaterThan(0)

                expect(tmp.section).toBe("global-supportgroups")
            }
            catch (e) {

                log(e.message)

                throw e;
            }

        }, 16000);
    });

    describe('dbnochange materials', async () => {

        test('dbnochange load & testing redirection', async () => {

            await driver.getProjectServer('/materials');

            await driver.testStatus();

            const path = await driver.getPathname();

            expect(path).toBe('/materials?language=English');

        });

        test('dbnochange change language', async () => {

            let tmp;

            try {

                const option = await driver.waitForElement(() => {

                    const list = Array.prototype.slice.call(document.querySelectorAll('[data-test="change-language"] option'));

                    if (list.length > 1) {

                        const first = list.find(e => {

                            if (e.value === 'English') {

                                return false;
                            }

                            return !!e.value;
                        });

                        if (first) {

                            return first;
                        }
                    }

                    return null;
                }, 1000);

                const curlang = await option.getText(); // German

                await option.click();

                tmp = await driver.waitForCustomEvent('mainRequest:material-list', (data, curlang) => {
                    return data && data.materialsSelectedLanguage == curlang
                }, curlang);

                expect(tmp.materialsSelectedLanguage).toBe(curlang);

                // expect(tmp.supportSelectedCountry.length).toBeGreaterThan(0);
                //
                // tmp = await driver.waitForCustomEvent('mainSuccess:global-supportgroups');
                //
                // log.dump(tmp);
                // expect(tmp).toBeGreaterThan(0)
            }
            catch (e) {

                log(e.message)

                throw e;
            }
        }, 10000);

    });

    describe('dbnochange awareness-day', async () => {

        // beforeAll(async () => {
        //
        // });
        //
        // afterAll(async () => {
        //
        //     await driver.sleepSec(1);
        // });

        test('dbnochange activity-wall', async () => {

            await driver.getProjectServer('/awareness-day/activity-wall');

            await driver.testStatus();

            const list = await driver.waitForJs(() => {

                const list = Array.prototype.slice.call(document.querySelectorAll('.activity-wall__post-wrapper')).map(e => parseInt(e.getAttribute('data-key'), 10));

                if (list.length) {

                    return list;
                }

                return false;
            });

            // await driver.sleepSec(2); // important sleep makes sure that masonry placed elements, important to avoid issue "Other element would receive the click"

            expect(list.length).toBeGreaterThan(0);

            await driver.scrollTo(200000);

            const button = await driver.waitForElement('[data-test="load-more-button"]');

            await button.click();

            const customEvent = await driver.waitForCustomEvent('mainRequest:mainSuccessAppend:awac-wall');

            await driver.scrollTo(200000);

            expect(customEvent.page).toBe(2); // page 2 loaded

            const newList = await driver.waitForJs(() => {

                const list = Array.prototype.slice.call(document.querySelectorAll('.activity-wall__post-wrapper')).map(e => parseInt(e.getAttribute('data-key'), 10));

                if (list.length) {

                    return list;
                }

                return false;
            });

            const firstPart = newList.splice(0, list.length);

            for (var i = 0, l = list.length ; i < l ; i += 1 ) {

                if (list[i] !== firstPart[i]) {

                    throw JSON.stringify({
                        error: 'list are not the same',
                        list,
                        firstPart
                    }, null, '    ');
                }

                if (newList[i] && list[i] === newList[i]) {

                    throw JSON.stringify({
                        error: `elements in first part and second shouldn't have the same ids`,
                        list,
                        newList
                    }, null, '    ');
                }
            }

            // await driver.sleepSec(0.5);

        }, 18000);
    });
});