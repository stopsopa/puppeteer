
const path = require('path');

const launch = require(path.resolve(__dirname, '..', '..', 'driver.js'));

describe('wait-custom-event', async () => {

    let browser;

    beforeAll(async () => {
        browser = await launch(true);
    });

    afterAll(async () => {
        await browser.close();
    });

    it('test', async () => {

        const page = await browser.page(true);

        await page.getServerTest('/web/007-wait-for-truthy-fn/index.html');

        const interval = 300;

        const data = 'data passed';

        // try {

        var json = await page.waitForJs(data => {

            const test = document.querySelectorAll('li').length > 3;

            if (test) {

                data.result = test ? 'true' : 'false';

                return data
            }

        }, {}, 300);
        // }
        // catch (e) {
        //
        //     log('catch:::');
        //     log.dump(e)
        //
        //     throw e;
        // }


        /**
         * test version
         */
        // var json = await page.evaluate(
        //     json => new Promise((res, rej) => {
        //
        //         eval('var fn = ' + json.fn);
        //
        //         logInBrowser('executed');
        //
        //         var handler, tmp;
        //
        //         function test() {
        //
        //             let result = fn(json.data);
        //
        //             logInBrowser('attempt: ' + (result ? 'true' : 'false'));
        //
        //             if (result) {
        //
        //                 logInBrowser('match');
        //
        //                 clearInterval(handler);
        //
        //                 res(result);
        //             }
        //         };
        //
        //         handler = setInterval(test, json.interval);
        //
        //         test();
        //     }),
        //     {
        //         fn,
        //         interval,
        //         data
        //     }
        // );

        // log('resutl')
        // log.dump(json)

        expect(json.result).toBe('true');
    });

    test('wait-for-js - init', async () => {

        const page = await browser.page(true);

        await page.getServerTest('/web/006-wait-custom-event/inline.html');

        const data = await page.waitForJs((data, carry) => {
            logInBrowser('test ' + JSON.stringify(carry))
            return carry.inc || false;
        }, {}, 50, carry => {
            logInBrowser('init')
            setTimeout(() => {
                logInBrowser('init - inside ' + JSON.stringify(carry))
                carry.inc = carry.inc || 5;
                carry.inc += 1;
            }, 300);
        });

        expect(data).toBe(6);
    });
});