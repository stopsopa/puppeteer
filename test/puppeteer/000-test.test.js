
const path = require('path');

const fs = require('fs');

const launch = require(path.resolve(__dirname, '..', '..', 'driver.js'));

const config = require('../../config');

describe('user', async () => {

    let browser, page;

    beforeAll(async () => {
        browser = await launch(true);

        page = await browser.page(true);
    });

    afterAll(async () => {
        await browser.close();
    });

    it('agent - file:// loaded', async () => {

        const html = path.resolve(__dirname, '../../web/puppeteer/005-on-console.html');

        await page.getServerTest(`file://${html}`);

        // Get the "viewport" of the page, as reported by the page.
        const dimensions = await page.evaluate(() => {
            return {
                width: document.documentElement.clientWidth, // 1920
                height: document.documentElement.clientHeight, // 1080
                devicePixelRatio: window.devicePixelRatio // 1
            };
        });

        expect(dimensions.width).toBe(1920)
        expect(dimensions.height).toBe(1080)
        expect(dimensions.devicePixelRatio).toBe(1);

        // await page.sleepSec(5);
    });

    it('agent', async () => {

        await page.getServerTest('/web/puppeteer/005-on-console.html');

        // page.log('test');

        // Get the "viewport" of the page, as reported by the page.
        const dimensions = await page.evaluate(() => {
            return {
                width: document.documentElement.clientWidth, // 1920
                height: document.documentElement.clientHeight, // 1080
                devicePixelRatio: window.devicePixelRatio // 1
            };
        });

        expect(dimensions.width).toBe(1920)
        expect(dimensions.height).toBe(1080)
        expect(dimensions.devicePixelRatio).toBe(1);

        // await page.sleepSec(5);
    });

    /**
     * From: https://github.com/GoogleChrome/puppeteer#usage
     */
    test('console.on()', async () => {

        await page.getServerTest('/web/puppeteer/005-on-console.html');

        const t = config.testServer;

        page.on('console', msg =>
            expect(msg.text()).toBe(
                `url is ${t.schema}://${t.host}:${t.port}/web/puppeteer/005-on-console.html`
            )
        );

        await page.evaluate(() => console.log(`url is ${location.href}`));

        // await page.sleepSec(3);
    });

    /**
     * From: https://puppeteersandbox.com/
     */
    test('iPhone 6 -> warmup page -> png', async () => {

        const devices = require('puppeteer/DeviceDescriptors');

        await page.emulate(devices['iPhone 6']);

        await page.getServerTest('/web/warmingup.html');

        const file = path.resolve(__dirname, 'full.png');

        if (fs.existsSync(file)) {

            fs.unlinkSync(file);
        }

        if (fs.existsSync(file)) {

            throw `File '${file} still exist'`;
        }

        await page.screenshot({
            path: file,
            fullPage: true
        });

        if ( ! fs.existsSync(file)) {

            throw `File '${file} was not created'`;
        }

        fs.unlinkSync(file);

        expect(await page.title()).toBe("Warming up...");

        // await page.sleepSec(5);
    });

    /**
     * From: https://github.com/GoogleChrome/puppeteer#usage
     */
    (config.launchOptions.headless ? it : it.skip)('iPhone 6 -> warmup page -> pdf (must be headless)', async () => {

        await page.getServerTest('/web/warmingup.html', {waitUntil: 'networkidle2'});

        const file = path.resolve(__dirname, 'hn.pdf');

        if (fs.existsSync(file)) {

            fs.unlinkSync(file);
        }

        if (fs.existsSync(file)) {

            throw `File '${file} still exist'`;
        }

        // await page.goto('https://news.ycombinator.com', {waitUntil: 'networkidle2'});

        // https://github.com/GoogleChrome/puppeteer/issues/576#issuecomment-325394862
        // only in headless
        await page.pdf({
            path: file,
            format: 'A4'
        });

        if ( ! fs.existsSync(file)) {

            throw `File '${file} was not created'`;
        }

        fs.unlinkSync(file);
    });

    it('agent', async () => {

        // selenium : https://stopsopa.github.io/research-protractor/e2e/angular-calc/calc.html

        await page.getServerTest('/web/001-js-click/index.html');

        const agent = await page.waitForJs(() => new Promise(resolve => {

            var inter = setInterval(() => {

                const agent = navigator.userAgent;

                if (agent) {

                    clearInterval(inter);

                    resolve(agent);
                }

            }, 200);

        }));

        // can't test exactly, can change in future, or can be different in different browser
        expect(agent.length).toBeGreaterThan(0);
    });
});