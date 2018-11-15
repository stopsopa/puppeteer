
const path = require('path');

const fs = require('fs');

const launch = require(path.resolve(__dirname, '..', '..', 'driver.js'));

const config = require('../../config');

const test = (a, b) => a + b;

describe('001css-root', async () => {

    let browser, page;

    beforeAll(async () => {

        browser = await launch(true);

        page = await browser.page(true);
    });

    afterAll(async () => {
        await browser.close();
    });

    it('5px', async () => {

        const page = await browser.page(true);

        await page.getServerEnv('/en/text');

        const text = await page.evaluate((one, two, three) => new Promise(resolve => {

            var inter = setInterval(() => {

                const el = document.querySelector('#app > footer');

                if (el) {

                    clearInterval(inter);

                    resolve({data: window.getComputedStyle(el).getPropertyValue('padding-top')});
                }

            }, 200);

        }), 'one', 'two', { three: 'four' });

        expect(text.data).toBe("5px");
    });
});