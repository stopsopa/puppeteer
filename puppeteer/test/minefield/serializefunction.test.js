
const serializefn = require('../../minefield/serializefunction');

const test = (a, b)=>a + b;

describe('serialize function', () => {

    it('is function', () => expect(typeof test).toBe('function'));

    it('serialized', () => {

        const tmp = serializefn.encode(test);

        expect(typeof tmp).toBe('string')

        expect(tmp).toBe("(a, b) => a + b");
    });

    it('decode', () => {

        const tmp = serializefn.encode(test);

        const tmp2 = serializefn.decode(tmp);

        expect(typeof tmp2).toBe('function')

        expect(tmp).toBe("(a, b) => a + b");
    });

    it('arythmetic test', () => {

        const tmp = serializefn.encode(test);

        const tmp2 = serializefn.decode(tmp);

        expect(tmp2(6, 8)).toBe(14);
    });
});