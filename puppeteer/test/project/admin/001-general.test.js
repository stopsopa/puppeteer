
const path = require('path');

const { By, promise, until, Key } = require('selenium-webdriver');

const log = require('../../../lib/logn');

const mysql = require('../../../lib/mysql/mysql');

const config = require(path.resolve(__dirname, '../../../config'));

const logn = (...args) => log.stack(2).log(...args, "\n");

describe('dbnochange mysql', async () => {

    let driver;

    let db;

    const sqlAtTheEnd = {};

    const toggleAside = async hide => {

        const hasHideClass = await driver.waitForJs(() => {

            const aside = document.querySelector('aside');

            if ( ! aside ) {

                return false;
            }

            return document.querySelector('aside').classList.contains('hide') ? 'true' : 'false'; // both truthy
        });

        if (typeof hide === 'undefined' || hasHideClass === (hide ? 'false' : 'true')) {

            const toggle = await driver.waitForElement('aside .toggle');

            await toggle.click();

            // await driver.sleepSec(0.3);
        }
    }

    beforeAll(async () => {

        db = mysql(config.mysql);

        driver = await require(path.resolve(__dirname, '..', '..', '..', 'driver.js'));

        await driver.getServerProject('/admin');

        await driver.testStatus();

        const inputUsername = await driver.waitForElement('[name="username"]');

        const configServer = require('../../../../app/server.config');

        await inputUsername.sendKeys(configServer.jwt.users[0].username);

        const inputPassword = await driver.waitForElement('[name="password"]');

        await inputPassword.sendKeys(configServer.jwt.users[0].password);

        await inputPassword.sendKeys(Key.ENTER);

        const box = await driver.waitForElement('[data-test="dashboard-box"]');

        expect(await box.getAttribute('data-test')).toBe('dashboard-box');
    });

    test('dbnochange tables list - check if users table exist', async () => {

        let list;

        try {

            list = await db.showTables();
        }
        catch (e) {

            log.dump(e)
        }

        expect(list).toContain('users')

    }, 8000);

    const categoryName = 'category name 22295844884884343';

    describe('dbchange categories', async () => {

        const clean = async () => {

            logn('clean() category');

            const response = await db.query(`
delete from category where name = :name;
            `, {
                name: categoryName
            }, {
                foreignKeyCheck: false
            });

            expect(response.affectedRows).toBeGreaterThanOrEqual(0);
        }

        beforeAll(clean);

        sqlAtTheEnd.clearCategories = clean;

        let id;

        test('dbchange create submit empty form - errors expected', async () => {

            await driver.getServerProject('/admin/categories');

            await driver.testStatus();

            const createButton = await driver.waitForElement('[data-test="category-create"]');

            await toggleAside(true);

            await createButton.click();

            const submitCategoryButton = await driver.waitForElement('[data-test="submit-category"]');

            await submitCategoryButton.click();

            const submitResult = await driver.waitForCustomEvent('categoriesEditSave');

            expect(submitResult.createErrorsNum).toBeGreaterThan(0);
        });

        test('dbchange create submit empty form - success expected', async () => {

            const inputName = await driver.waitForElement('[data-test="name"]');

            inputName.sendKeys(categoryName);

            const inputDescripton = await driver.waitForElement('[data-test="descripton"]');

            inputDescripton.sendKeys('Test description');

            const submitCategoryButton = await driver.waitForElement('[data-test="submit-category"]');

            await submitCategoryButton.click();

            const data = await driver.waitForCustomEvent('categoriesEditSave');

            expect(data.mode).toBe('created');

            expect(data.createdId).toBeGreaterThan(0);

            id = data.createdId;

            expect(data.createdName).toBe(categoryName);
        });

        test('dbchange delete', async () => {

            expect(id).toBeGreaterThan(0);

            const button = await driver.waitForElement(`[data-test="${id}"]`);

            await button.click();

            const yesButton = await driver.waitForElement('[data-test="delete-category-popup-yes-button"]');

            await yesButton.click();

            const data = await driver.waitForCustomEvent('categoriesDelete');

            expect(data.deletedCategoryId).toBe(id);
        });

    });

    describe('dbchange subcategories', async () => {

        const subCategoryName = 'subcategory name 22295844884884343';

        const clean = async () => {

            logn('clean() subcategory');

            const response = await db.query('delete from `sub_category` where name = :name', {
                name: subCategoryName
            }).catch(e => expect(e).toBeUndefined());

            expect(response.affectedRows).toBeGreaterThanOrEqual(0);
        }

        beforeAll(async () => {

            clean();

            let result = db.category.insert({
                name        : categoryName,
                description : 'description',
            })

            result.catch(e => expect(e).toBeUndefined());

            result = await result;

            expect(result.affectedRows).toBeGreaterThanOrEqual(0);
        });

        sqlAtTheEnd.clearSubcategories = clean;

        let id;

        test('dbchange create submit empty form - errors expected', async () => {

            await driver.getServerProject('/admin/subcategories');

            await driver.testStatus();

            const createButton = await driver.waitForElement('[data-test="category-create"]');

            await toggleAside(true);

            await createButton.click();

            const submitCategoryButton = await driver.waitForElement('[data-test="submit-subcategory"]');

            await submitCategoryButton.click();

            const submitResult = await driver.waitForCustomEvent('subcategoriesEditSave');

            expect(submitResult.createErrorsNum).toBeGreaterThan(0);
        });

        test('dbchange create submit empty form - success expected', async () => {

            const inputName = await driver.waitForElement('[data-test="name"]');

            inputName.sendKeys(subCategoryName);

            const inputDescripton = await driver.waitForElement('[data-test="descripton"]');

            inputDescripton.sendKeys('Test description');

            await driver.semanticOption('[data-test="categories"]', categoryName);

            const submitCategoryButton = await driver.waitForElement('[data-test="submit-subcategory"]');

            await submitCategoryButton.click();

            const data = await driver.waitForCustomEvent('subcategoriesEditSave');

            expect(data.mode).toBe('created');
            expect(data.createdId).toBeGreaterThan(0);
            expect(data.createdName).toBe(subCategoryName);

            id = data.createdId;

            sqlAtTheEnd.removeSubcategory = (() => logn(`del: ${data.createdId}`))

            // await driver.sleepSec(2);

        });

        // test('dbchange delete', async () => {
        //
        //     expect(id).toBeGreaterThan(0);
        //
        //     const button = await driver.waitForElement(`[data-test="${id}"]`);
        //
        //     await button.click();
        //
        //     const yesButton = await driver.waitForElement('[data-test="delete-category-popup-yes-button"]');
        //
        //     await yesButton.click();
        //
        //     const data = await driver.waitForCustomEvent('categoriesDelete');
        //
        //     expect(data.deletedCategoryId).toBe(id);
        // });

    });

    afterAll(async () => {

        await driver.quit();

        (async function (list) {

            let tmp;

            while (tmp = list.shift()) {

                logn('clear: ' + tmp);

                try {

                    await sqlAtTheEnd[tmp]();
                }
                catch (e) {

                    log('clear: ' + tmp + ' crashed');
                    log.dump(e)
                }
            }

            await db.pool.end();

        }(Object.keys(sqlAtTheEnd)));

    });
});