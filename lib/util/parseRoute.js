'use strict';

const qs = require('qs');

/* -------------------------------------------------------------------------- *
 * parseRoute
 *
 * Splits a route string into a url and querystring. 
 * -------------------------------------------------------------------------- */

module.exports = function parseRoute(route) {
  const [_, endpoint, query] = route.match(/^([^?]+)\??(.+)?$/);
  return {
    url: endpoint,
    qs: qs.parse(query)
  }
}
