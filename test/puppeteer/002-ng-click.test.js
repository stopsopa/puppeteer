
const path = require('path');

const launch = require(path.resolve(__dirname, '..', '..', 'driver.js'));

describe('ng-click', async () => {

    let browser;

    beforeAll(async () => {
        browser = await launch(true);
    });

    afterAll(async () => {
        await browser.close();
    });

    it('test', async () => {

        const page = await browser.page(true);

        await page.getServerTest('/web/002-ng-calc/calc.html');

        await page.focus('[ng-model="second"]');

        await page.keyboard.type('89');

        await page.focus('[ng-model="first"]');

        await page.keyboard.type('74');

        // https://github.com/GoogleChrome/puppeteer/blob/master/lib/USKeyboardLayout.js
        await page.keyboard.press('Enter');

        const selector = '.table > tbody > tr:nth-child(1) > td:nth-child(3)';

        await page.waitFor(selector);

        const text = await page.$eval(selector, e => e.innerText);

        expect(text).toBe('163');
    });
});