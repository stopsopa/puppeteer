
const path = require('path');

const launch = require(path.resolve(__dirname, '..', '..', 'driver.js'));

describe('wait-for-js-dynamic-fn', async () => {

    let browser;

    beforeAll(async () => {
        browser = await launch(true);
    });

    afterAll(async () => {
        await browser.close();
    });

    it('test', async () => {

        const page = await browser.page(true);

        await page.getServerEnv('/web/005-wait-for-js-dynamic-fn/index.html');

        const json = await page.evaluate(json => new Promise(resolve => {

            logInBrowser('executed')

            var handler, tmp;

            function test() {

                tmp = window.getComputedStyle(document.querySelector('.test3'), null).getPropertyValue("color");

                logInBrowser('color: ' + tmp);

                if (tmp === "rgba(83, 86, 240, 0.93)") {

                    logInBrowser('match');

                    clearInterval(handler);

                    json.isblue = tmp;

                    resolve(json);
                }
            };

            handler = setInterval(test, 300);

            test();

        }), {
            test: 'data passed from test'
        });


        expect(json.isblue).toBe("rgba(83, 86, 240, 0.93)");
        expect(json.test).toBe("data passed from test");
    });
});