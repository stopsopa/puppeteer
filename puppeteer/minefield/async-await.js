/**
 * https://youtu.be/NoRYn6gOtVo?t=26m10s
 */

const time = () => (new Date()).toISOString().substring(0, 19).replace('T', ' ');
const log = function (...args) {
    console.log(...[time(), ...args])
};
const fn = n => new Promise(resolve => {
    setTimeout(resolve, 2000, 'promise resolved: ' + n);
});
const fne = n => new Promise((resolve, reject) => {
    setTimeout(reject, 2000, 'promise rejected: ' + n);
});

async function test () {
    log('start test');
    let x;
    log('msg', await fn(1));
    log('msg', x = await fn(2));
    log('end test');
    return 'test() ' + x;
};

async function teste () {
    log('start');
    let x;
    log('msg> ', await fn(3));
    log('msg> ', x = await fn(5));
    log('test> ', await test());
    log('end teste');

    let y;
    try {
        await fne(4);
    }
    catch (e) {
        y = e;
    }

    return 'teste() >' + x + '<>' + y + '<'
};

(async function () {

    const one = await fn(1);

    log('one', one)

    await fn(2)
        .then(r => log('two', r))
    ;

    // so above means that these lines are equivalent:
    //      log('one', await fn(1))
    //      await fn(1).then(r => log('one', r));

    const three = await fn(3);

    log('three', three);

    const test = await teste();

    log('test:', test)
}());


(function () {
    const list = ['one', 'two', 'three'];
    const test = async () => {
        let tmp;
        while (tmp = list.shift()) {

            const val = await new Promise(res => setTimeout(res, 1000, tmp));

            console.log('val', val)
        }

        console.log('end...')
    }
    test();
}())


// 2018-03-13 23:18:18 one promise resolved: 1
// 2018-03-13 23:18:20 two promise resolved: 2
// 2018-03-13 23:18:22 three promise resolved: 3
// 2018-03-13 23:18:22 start
// 2018-03-13 23:18:24 msg>  promise resolved: 3
// 2018-03-13 23:18:26 msg>  promise resolved: 5
// 2018-03-13 23:18:26 start test
// 2018-03-13 23:18:28 msg promise resolved: 1
// 2018-03-13 23:18:30 msg promise resolved: 2
// 2018-03-13 23:18:30 end test
// 2018-03-13 23:18:30 test>  test() promise resolved: 2
// 2018-03-13 23:18:30 end teste
// 2018-03-13 23:18:32 test: teste() >promise resolved: 5<>promise rejected: 4<