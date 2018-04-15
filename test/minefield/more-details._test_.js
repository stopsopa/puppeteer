/**
 * https://github.com/facebook/jest/issues/5902
 */
describe('gimme more', () => {
    it('async', async () => {
        await Promise.reject({
            test: 'val'
        });
    });
    it('classic', () => {
        throw {
            test: 'val'
        };
    });
    it('failed at stackFormatter', async () => {
        await new Promise((resolve, reject) => { reject() });
    });
});

