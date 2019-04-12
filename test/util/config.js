'use strict';

const v = require('./values');

/* -------------------------------------------------------------------------- *
 * Config used for all tests.
 * -------------------------------------------------------------------------- */

module.exports = (presets) => ({
  apis: {
    foo: {
      decorateRequest: async (req, get) => {
        req.headers['x-clappy-uuid'] = process.env.CLAPPY_UUID;
        req.headers['x-decoration-key'] = await get('decorationKey');
        return req;
      },
      decorateResponse: async (res, get) => {
        res.headers['x-decoration-key'] = await get('decorationKey');
        return res;
      },
      grantTypes: [
        'client_credentials',
        'password'
      ],
      definitions: {
        local: {
          authUrl       : v.FOO_LOCAL_AUTH_URL,
          baseUrl       : v.FOO_LOCAL_BASE_URL,
          decorationKey : v.FOO_LOCAL_DECORATION_KEY,
          clientId      : v.FOO_LOCAL_CLIENT_ID,
          clientSecret  : v.FOO_LOCAL_CLIENT_SECRET,
          username      : v.FOO_LOCAL_USERNAME,
          password      : v.FOO_LOCAL_PASSWORD
        },
        staging: {
          authUrl       : v.FOO_STAGING_AUTH_URL,
          baseUrl       : v.FOO_STAGING_BASE_URL,
          decorationKey : v.FOO_STAGING_DECORATION_KEY,
          clientId      : v.FOO_STAGING_CLIENT_ID,
          clientSecret  : v.FOO_STAGING_CLIENT_SECRET,
          username      : v.FOO_STAGING_USERNAME,
          password      : v.FOO_STAGING_PASSWORD
        },
        prod: {
          authUrl       : v.FOO_PROD_AUTH_URL,
          baseUrl       : v.FOO_PROD_BASE_URL,
          decorationKey : v.FOO_PROD_DECORATION_KEY,
          clientId      : v.FOO_PROD_CLIENT_ID,
          clientSecret  : v.FOO_PROD_CLIENT_SECRET,
          username      : v.FOO_PROD_USERNAME,
          password      : v.FOO_PROD_PASSWORD
        }
      }
    },
    bar: {
      decorateRequest: async (req, get) => {
        req.headers['x-clappy-uuid'] = process.env.CLAPPY_UUID;
        req.headers['x-decoration-key'] = await get('decorationKey');
        return req;
      },
      decorateResponse: async (res, get) => {
        res.headers['decoration-key'] = await get('decorationKey');
        return res;
      },
      grantTypes: [
        'password',
        'client_credentials'
      ],
      definitions: {
        local: {
          authUrl       : v.BAR_LOCAL_AUTH_URL,
          baseUrl       : v.BAR_LOCAL_BASE_URL,
          decorationKey : v.BAR_LOCAL_DECORATION_KEY,
          clientId      : v.BAR_LOCAL_CLIENT_ID,
          clientSecret  : v.BAR_LOCAL_CLIENT_SECRET,
          username      : v.BAR_LOCAL_USERNAME,
          password      : v.BAR_LOCAL_PASSWORD
        },
        int: {
          authUrl       : v.BAR_INT_AUTH_URL,
          baseUrl       : v.BAR_INT_BASE_URL,
          decorationKey : v.BAR_INT_DECORATION_KEY,
          clientId      : v.BAR_INT_CLIENT_ID,
          clientSecret  : v.BAR_INT_CLIENT_SECRET,
          username      : v.BAR_INT_USERNAME,
          password      : v.BAR_INT_PASSWORD
        },
        prod: {
          authUrl       : v.BAR_PROD_AUTH_URL,
          baseUrl       : v.BAR_PROD_BASE_URL,
          decorationKey : v.BAR_PROD_DECORATION_KEY,
          clientId      : v.BAR_PROD_CLIENT_ID,
          clientSecret  : v.BAR_PROD_CLIENT_SECRET,
          username      : v.BAR_PROD_USERNAME,
          password      : v.BAR_PROD_PASSWORD
        }
      }
    }
  }
});
