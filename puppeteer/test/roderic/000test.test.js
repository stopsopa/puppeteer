
const path = require('path');

const fs = require('fs');

const launch = require(path.resolve(__dirname, '..', '..', 'driver.js'));

const config = require('../../config');

const test = (a, b) => a + b;

describe('roderic test', async () => {

    let browser, page;

    beforeAll(async () => {

        browser = await launch(true);

        page = await browser.page(true);
    });

    afterAll(async () => {
        await browser.close();
    });

    it('add', async () => {

        const tmp = test(1, 3);

        expect(tmp).toBe(4);
    });

    it('de test-page', async () => {

        const page = await browser.page(true);

        await page.getServerEnv('/de/test-page');

        const text = await page.evaluate((one, two, three) => new Promise(resolve => {

            var inter = setInterval(() => {

                const el = document.querySelector('.main-page');

                if (el) {

                    clearInterval(inter);

                    resolve({data: el.innerText + ` ${one} - ${two} - ${three.three}`});
                }

            }, 200);

        }), 'one', 'two', { three: 'four' });

        expect(text.data).toBe(`lang: "de" slug: "test-page" one - two - four`);
    });
});