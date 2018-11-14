
const path = require('path');

const log = require('../lib/logn');

const logn = (...args) => log.stack(2).log(...args, "\n");

const launch = require(path.resolve(__dirname, '..', 'driver.js'));

const config = require('../config');

describe('js-click', async () => {

    let browser, page;

    beforeAll(async () => {

        browser = await launch(true);

        page = await browser.page(true);
    });

    afterAll(async () => {
        await browser.close();
    });

    it('warmingup', async () => {

        // const html = path.resolve(process.env.ROOTDIR, 'web/puppeteer/005-on-console.html');

        const html = path.resolve(__dirname, '..', 'web', 'warmingup.html');

        await page.getServerEnv(`file://${html}`);

        const data = await page.waitForCustomEvent('warmingup');

        expect(data).toBe('Warming up...');
    });
});