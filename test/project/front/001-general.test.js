
const path = require('path');

const launch = require(path.resolve(__dirname, '..', '..', 'driver.js'));

const log = require('../../lib/logn');

describe('009-waitForElement-navigation', async () => {

    let browser, page;

    beforeAll(async () => {

        browser = await launch(true);

        page = await browser.page(true);
    });

    afterAll(async () => {
        await browser.close();
    });

    test('try', async () => {

        await page.getServerTest('/web/009-waitForElement-navigation/001.html');

        const submit = await page.$('[type="submit"]');

        await submit.click();

        await page.waitForNavigation();
        await page.waitForNavigation();
        await page.waitForNavigation();

        const button = await page.waitForElement('.find-me');

        // log.dump(button);

        const text = await page.evaluate(e => e.innerText, button);

        expect(text).toBe("you found me");

    }, 10000);
});