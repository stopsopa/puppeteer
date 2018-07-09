
const path = require('path');

const launch = require(path.resolve(__dirname, '..', '..', 'driver.js'));

describe('wait-for-element-async-waitFor', async () => {

    let browser;

    beforeAll(async () => {
        browser = await launch(true);
    });

    afterAll(async () => {
        await browser.close();
    });

    it('test', async () => {

        const page = await browser.page(true);

        await page.getServerEnv('/web/003-wait-for-element-async/index.html');

        const text = await page.evaluate((one, two, three) => new Promise(resolve => {

            var inter = setInterval(() => {

                const el = document.querySelector('.dynamic');

                if (el) {

                    clearInterval(inter);

                    resolve({data: el.innerText + ` ${one} - ${two} - ${three.three}`});
                }

            }, 200);

        }), 'one', 'two', { three: 'four' });

        expect(text.data).toBe("test 3 text modified one - two - four");
    });
});