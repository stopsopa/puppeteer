'use strict';

const path  = require('path');

const fs    = require('fs');

// const dist  = path.resolve(__dirname, '..', process.env.WEBPACK_WEBDIR || 'docs', 'dist');

module.exports = function (dist, core) {

    const js = path.resolve(dist, `${core}.bundle.js`);

    const cs = path.resolve(dist, `${core}.bundle.css`);

    const prod = (process.env.WEBPACK_MODE === 'prod');

    if (prod) {

        expect(fs.existsSync(js + '.map')).toEqual(true);

        expect(fs.existsSync(cs + '.map')).toEqual(true);
    }

    return {
        js      : fs.readFileSync(js).toString(),
        css     : fs.readFileSync(cs).toString(),
        tjs     : function (str, num) {
            return expect(occurrences(this.js, str)).toEqual(num);
        },
        tcss    : function (str, num) {
            return expect(occurrences(this.css, str)).toEqual(num);
        }
    };
}

/** Function that count occurrences of a substring in a string;
 *
 * https://stackoverflow.com/a/7924240/5560682
 *
 * @param {String} string               The string
 * @param {String} subString            The sub string to search for
 * @param {Boolean} [allowOverlapping]  Optional. (Default:false)
 *
 * @author Vitim.us https://gist.github.com/victornpb/7736865
 * @see Unit Test https://jsfiddle.net/Victornpb/5axuh96u/
 * @see http://stackoverflow.com/questions/4009756/how-to-count-string-occurrence-in-string/7924240#7924240
 */
function occurrences(string, subString, allowOverlapping) {

    string += "";
    subString += "";
    if (subString.length <= 0) return (string.length + 1);

    var n = 0,
        pos = 0,
        step = allowOverlapping ? 1 : subString.length;

    while (true) {
        pos = string.indexOf(subString, pos);
        if (pos >= 0) {
            ++n;
            pos += step;
        } else break;
    }
    return n;
}