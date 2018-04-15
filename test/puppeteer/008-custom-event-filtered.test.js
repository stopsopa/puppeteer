
const path = require('path');

const launch = require(path.resolve(__dirname, '..', '..', 'driver.js'));

describe('008-custom-event-filtered', async () => {

    let browser, page;

    beforeAll(async () => {
        browser = await launch(true);

        page = await browser.page(true);
    });

    afterAll(async () => {
        await browser.close();
    });

    test('subscribed to wrong event', async () => {

        await page.getTestServer('/web/008-custom-event-filtered/index.html?wrong');

        const data = await page.waitForCustomEvent('test');

        expect(data.value_to_test).toBe('fake previous remaining event')

    }, 4000);

    test('subscribed and filter event - button waitForElement', async () => {

        await page.getTestServer('/web/008-custom-event-filtered/button.html?filtered_and_sequence');
        // await driver.get('https://stopsopa.github.io/state-of-selenium/web/008-custom-event-filtered/index.html?filtered_and_sequence');

        // all below are equivalents:

        // const button = await page.waitForElement(data => document.querySelector(data.test), 300, {test:'button'});
        // const button = await page.waitForElement(data => document.querySelector(data), 300, 'button');
        // const button = await page.waitForElement(() => document.querySelector('button'));
        const button = await page.waitForElement('button');

        await button.click();

        const data = await page.waitForCustomEvent('test', (data, filter) => {
            return data.value_to_test === filter.value
        }, {
            value: "the event that we waiting for: go"
        });

        expect(data.value_to_test).toBe("the event that we waiting for: go")

        // await page.sleepSec(3);
    }, 8000);

    test('subscribed and filter event - button waitForElements', async () => {

        await page.getTestServer('/web/008-custom-event-filtered/button.html?filtered_and_sequence');
        // await driver.get('https://stopsopa.github.io/state-of-selenium/web/008-custom-event-filtered/index.html?filtered_and_sequence');

        // all below are equivalents:

        // const button = await page.waitForElement(data => document.querySelector(data.test), 300, {test:'button'});
        // const button = await page.waitForElement(data => document.querySelector(data), 300, 'button');
        // const button = await page.waitForElement(() => document.querySelector('button'));
        const buttons = await page.waitForElements('button');

        await buttons[0].click();

        const data = await page.waitForCustomEvent('test', (data, filter) => {
            return data.value_to_test === filter.value
        }, {
            value: "the event that we waiting for: go"
        });

        expect(data.value_to_test).toBe("the event that we waiting for: go")

        // await page.sleepSec(3);
    }, 8000);

    test('subscribed and filter event - select,option', async () => {

        await page.getTestServer('/web/008-custom-event-filtered/index.html?filtered_and_sequence');
        // await driver.get('https://stopsopa.github.io/state-of-selenium/web/008-custom-event-filtered/index.html?filtered_and_sequence');

        const value = await page.waitForJs(() => {

            const option = document.querySelectorAll('select option')[1];

            if (option) {

                return option.value;
            }
        });

        expect(value.length).toBeGreaterThan(0);

        await page.select('select', value);

        const data = await page.waitForCustomEvent('test', (data, filter) => {
            return data.value_to_test === filter.value
        }, {
            value: "the event that we are waiting for: two"
        });

        expect(data.value_to_test).toBe("the event that we are waiting for: two")

    }, 7000);

    test('test selenium.js itself', async () => {

        let text = await page.waitForJs(() => {
            const pre = document.querySelector('pre');

            if (pre) {

                return pre.innerText;
            }
        });

        text = text.split("\n").map(e => e.substring(19)).join("\n");

        // log.dump(text)
        // 2018-03-30 23:39:31 test/examples/008-custom-event-filtered.test.js:64
        // [String]: >: ... but action was done now
        // : {"subscribe_triggered":{"value_to_test":"the event that we waiting for: two"}}
        // : {"subscribe_triggered_permanent":{"value_to_test":"the event that we waiting for: two"}}
        // : {"subscribe_triggered_permanent":{"value_to_test":"the event that we waiting for: two"}}
        // : {"subscribe_triggered_permanent":{"value_to_test":"fake previous remaining event"}}
        // : change triggered, but wait...two
        // : {"subscribe_triggered_permanent":{"value_to_test":"fake previous remaining event"}}
        // : {"subscribe_triggered":{"value_to_test":"fake previous remaining event"}}< len: 575  -- without last line

        expect(text.trim()).toMatchSnapshot()

    }, 7000);
});