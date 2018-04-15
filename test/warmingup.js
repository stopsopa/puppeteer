
const path = require('path');

const { By, promise } = require('selenium-webdriver');

const log = require('../lib/logn');

const logn = (...args) => log.stack(2).log(...args, "\n");

describe('js-click', async () => {

    let driver;

    beforeAll(async () => {

        driver = await require(path.resolve(__dirname, '..', 'driver.js'));
    });

    it('warmingup', async () => {

        const html = path.resolve(__dirname, '..', 'web', 'warmingup.html');

        await driver.get(`file://${html}`);

        const data = await driver.waitForCustomEvent('warmingup');

        expect(data).toBe('Warming up...');
    });

    afterAll(async () => {

        await driver.quit();
    });
});