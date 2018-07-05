
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

        await page.getServerTest('/web/006-wait-custom-event/inline.html');

        await page.click('button');

        const json = await page.waitForCustomEvent('test_event');

        expect(json.value).toBe("data passed from js");

        // await page.sleepSec(5);
    });
});