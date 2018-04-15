
module.exports = {
    encode: function (fn) {

        if (typeof fn === 'function') {

            return fn.toString();
        }

        return false;
    },
    decode: function (fnstr) {

        if (typeof fnstr === 'string') {

            eval('var __tmp__ = ' + fnstr);

            if (typeof __tmp__ === 'function') {

                return __tmp__;
            }
        }

        return false;
    }
};