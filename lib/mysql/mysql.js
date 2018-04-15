'use strict';

var path        = require('path');
var mysql       = require('mysql');
var log         = require('../logn');

var abstract    = require(path.resolve(__dirname, 'db_abstract.jsx'));

const moment    = require('moment');

module.exports = function (config) {

    const pool      = mysql.createPool(config);

    pool
        .on('connection', function (connection) {
            connection
                .query('SET NAMES utf8')
                .on('error', function(err) {
                    log.json(err); // 'ER_BAD_DB_ERROR'
                })
            ;
        })
    ;

    function extend(table, id, more) {
        function cache() {
            abstract.apply(this, arguments);
        }
        cache.prototype = Object.create(abstract.prototype);
        cache.prototype.constructor = cache;

        Object.assign(cache.prototype, more || {});

        return new cache(table, id, pool);
    }

    const tool = extend(null, null, {});

    tool.pool = pool;

    tool.users = extend('spark_cache', 'id', {
        testusers: function () {
            log('testusers...')
        }
    });

    tool.sub_category       = extend('sub_category', 'id');
    tool.category           = extend('category', 'id');

    tool.now = function () {
        return moment().format('YYYY-MM-DD HH:mm:ss');
    };

    return tool;
}