'use strict';

/* -------------------------------------------------------------------------- *
 * Jest global teardown module - closes test server
 * -------------------------------------------------------------------------- */

module.exports = require('./server').down;
