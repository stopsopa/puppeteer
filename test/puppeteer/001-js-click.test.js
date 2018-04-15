
const path = require('path');

const launch = require(path.resolve(__dirname, '..', '..', 'driver.js'));

describe('js-click', async () => {

    let browser;

    beforeAll(async () => {
        browser = await launch(true);
    });

    afterAll(async () => {
        await browser.close();
    });

    it('test', async () => {

        const page = await browser.page(true);

        await page.getTestServer('/web/001-js-click/index.html');

        await page.click('#go');

        await page.click('div');

        // const text = await page.evaluate(() => document.querySelector('div').innerText);

        const text = await page.$eval('div', e => e.innerText);

        expect(text).toBe('clicked');

        // await page.sleepSec(5);
    });
});