
const path = require('path');

const launch = require(path.resolve(__dirname, '..', '..', 'driver.js'));

describe('wait-for-js-fixed-time', async () => {

    let browser;

    beforeAll(async () => {
        browser = await launch(true);
    });

    afterAll(async () => {
        await browser.close();
    });

    it('test', async () => {

        const page = await browser.page(true);

        await page.getServerTest('/web/004-wait-for-js-fixed-time/index.html');

        const json = await page.evaluate(json => new Promise(resolve => {

            logInBrowser('executed')

            setTimeout(() => {

                json.added = 'in browser';

                json.realdata = window.getComputedStyle(document.querySelector('.test3'), null).getPropertyValue("color");

                resolve(json);

            }, 300);

        }), {
            test: 'data passed from test'
        });

        expect(json.added).toBe("in browser");
        expect(json.realdata).toBe("rgb(0, 0, 255)");
        expect(json.test).toBe("data passed from test");

        expect(page.json(json)).toBe(
            page.json(
                JSON.parse('{"realdata":"rgb(0, 0, 255)","test":"data passed from test","added":"in browser"}')
            )
        );
    });
});