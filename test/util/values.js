'use strict';

const _ = require('lodash');

/* -------------------------------------------------------------------------- *
 * Static values for use in testing.
 * -------------------------------------------------------------------------- */

module.exports = {

  /* ------------------------------------------------------------------------ *
   * UTILS
   * ------------------------------------------------------------------------ */

  get: function (apiId, envId, description) {
    const key = [apiId, envId, description].map(_.toUpper).join('_');
    return this[key];
  },


  /* ------------------------------------------------------------------------ *
   * FOO / LOCAL
   * ------------------------------------------------------------------------ */

  FOO_LOCAL_AUTH_URL         : 'http://localhost:7357/foo/local/oauth2/auth',
  FOO_LOCAL_BASE_URL         : 'http://localhost:7357/foo/local/2.0',
  FOO_LOCAL_DECORATION_KEY   : 'FOO_LOCAL_DECORATION_KEY',
  FOO_LOCAL_CLIENT_ID        : 'FOO_LOCAL_CLIENT_ID',
  FOO_LOCAL_CLIENT_SECRET    : 'FOO_LOCAL_CLIENT_SECRET',
  FOO_LOCAL_USERNAME         : 'foo.local@test.com',
  FOO_LOCAL_PASSWORD         : 'FOO_LOCAL_PASSWORD',
  FOO_LOCAL_CC_TOKEN         : 'FOO_LOCAL_CC_TOKWN',
  FOO_LOCAL_PW_TOKEN         : 'FOO_LOCAL_PW_TOKEN',


  /* ------------------------------------------------------------------------ *
   * FOO / STAGING
   * ------------------------------------------------------------------------ */

  FOO_STAGING_AUTH_URL       : 'http://localhost:7357/foo/staging/oauth2/auth',
  FOO_STAGING_BASE_URL       : 'http://localhost:7357/foo/staging/2.0',
  FOO_STAGING_DECORATION_KEY : 'FOO_STAGING_DECORATION_KEY',
  FOO_STAGING_CLIENT_ID      : 'FOO_STAGING_CLIENT_ID',
  FOO_STAGING_CLIENT_SECRET  : 'FOO_STAGING_CLIENT_SECRET',
  FOO_STAGING_USERNAME       : 'foo.staging@test.com',
  FOO_STAGING_PASSWORD       : 'FOO_STAGING_PASSWORD',
  FOO_STAGING_CC_TOKEN       : 'FOO_STAGING_CC_TOKEN',
  FOO_STAGING_PW_TOKEN       : 'FOO_STAGING_PW_TOKEN',


  /* ------------------------------------------------------------------------ *
   * FOO / PROD
   * ------------------------------------------------------------------------ */

  FOO_PROD_AUTH_URL          : 'http://localhost:7357/foo/prod/oauth2/auth',
  FOO_PROD_BASE_URL          : 'http://localhost:7357/foo/prod/2.0',
  FOO_PROD_DECORATION_KEY    : 'FOO_PROD_DECORATION_KEY',
  FOO_PROD_CLIENT_ID         : 'FOO_PROD_CLIENT_ID',
  FOO_PROD_CLIENT_SECRET     : 'FOO_PROD_CLIENT_SECRET',
  FOO_PROD_USERNAME          : 'foo.prod@test.com',
  FOO_PROD_PASSWORD          : 'FOO_PROD_PASSWORD',
  FOO_PROD_CC_TOKEN          : 'FOO_PROD_CC_TOKEN',
  FOO_PROD_PW_TOKEN          : 'FOO_PROD_PW_TOKEN',


  /* ------------------------------------------------------------------------ *
   * BAR / LOCAL
   * ------------------------------------------------------------------------ */

  BAR_LOCAL_AUTH_URL         : 'http://localhost:7357/bar/local/oauth2/auth',
  BAR_LOCAL_BASE_URL         : 'http://localhost:7357/bar/local/2.0',
  BAR_LOCAL_DECORATION_KEY   : 'BAR_LOCAL_DECORATION_KEY',
  BAR_LOCAL_CLIENT_ID        : 'BAR_LOCAL_CLIENT_ID',
  BAR_LOCAL_CLIENT_SECRET    : 'BAR_LOCAL_CLIENT_SECRET',
  BAR_LOCAL_USERNAME         : 'bar.local@test.com',
  BAR_LOCAL_PASSWORD         : 'BAR_LOCAL_PASSWORD',
  BAR_LOCAL_CC_TOKEN         : 'BAR_LOCAL_CC_TOKEN',
  BAR_LOCAL_PW_TOKEN         : 'BAR_LOCAL_PW_TOKEN',


  /* ------------------------------------------------------------------------ *
   * BAR / INT
   * ------------------------------------------------------------------------ */

  BAR_INT_AUTH_URL           : 'http://localhost:7357/bar/int/oauth2/auth',
  BAR_INT_BASE_URL           : 'http://localhost:7357/bar/int/2.0',
  BAR_INT_DECORATION_KEY     : 'BAR_INT_DECORATION_KEY',
  BAR_INT_CLIENT_ID          : 'BAR_INT_CLIENT_ID',
  BAR_INT_CLIENT_SECRET      : 'BAR_INT_CLIENT_SECRET',
  BAR_INT_USERNAME           : 'bar.int@test.com',
  BAR_INT_PASSWORD           : 'BAR_INT_PASSWORD',
  BAR_INT_CC_TOKEN           : 'BAR_INT_CC_TOKEN',
  BAR_INT_PW_TOKEN           : 'BAR_INT_PW_TOKEN',


  /* ------------------------------------------------------------------------ *
   * BAR / PROD
   * ------------------------------------------------------------------------ */

  BAR_PROD_AUTH_URL          : 'http://localhost:7357/bar/prod/oauth2/auth',
  BAR_PROD_BASE_URL          : 'http://localhost:7357/bar/prod/2.0',
  BAR_PROD_DECORATION_KEY    : 'BAR_PROD_DECORATION_KEY',
  BAR_PROD_CLIENT_ID         : 'BAR_PROD_CLIENT_ID',
  BAR_PROD_CLIENT_SECRET     : 'BAR_PROD_CLIENT_SECRET',
  BAR_PROD_USERNAME          : 'bar.prod@test.com',
  BAR_PROD_PASSWORD          : 'BAR_PROD_PASSWORD',
  BAR_PROD_CC_TOKEN          : 'BAR_PROD_CC_TOKEN',
  BAR_PROD_PW_TOKEN          : 'BAR_PROD_PW_TOKEN',


  /* ------------------------------------------------------------------------ *
   * REQUESTS AND RESPONSES
   * ------------------------------------------------------------------------ */

  REQ_PATH_ROOT              : 'resource',
  REQ_PATH                   : 'resource?key=val',
  REQ_PATH_ALT               : 'resource?key2=val2',
  REQ_BODY                   : { mock: 'BODY' }
}