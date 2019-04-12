'use strict';

const _ = require('lodash');
const path = require('path');
const request = require('request-promise-native');
const { spawn } = require('child_process');
const uuid = require('uuid/v4');

const Clappy = require('../../clappy');
const v = require('./values');
const config = require('./config');

module.exports = {

  /* ------------------------------------------------------------------------ *
   * run()
   *
   * Runs Clappy commands and returns the Clappy response and log of requests
   * made against the test server. A unique ID is generated for the instance,
   * which is stored as an environment variable and appended to requests made
   * by the test apis.
   *
   * If a function is provided, commands are run in module mode using a fresh
   * Clappy chain.
   *
   * If one or more strings are provided, commands are run in static mode in
   * a child process.
   * ------------------------------------------------------------------------ */

  async run (...commands) {
    const instId = uuid();
    const historyUri = `http://localhost:7357/history/${instId}`;
    let requests = [];
    let response = null;
    let resolved = false;
    let error = null;

    // Module mode
    if (_.isFunction(commands[0])) {
      process.env.CLAPPY_UUID = instId;
      try {
        const clappy = new Clappy(config);
        response = await commands[0](clappy);
        requests = await request.get(historyUri, { json: true });
        return { requests, response, resolved: true, error };
      } catch (err) {
        requests = await request.get(historyUri, { json: true });
        return { requests, response, resolved, error: err };
      }

    }

    // Static mode
    return new Promise((resolve, reject) => {
      let errText = '';
      let response = '';
      const proc = spawn('node', ['./clappy.js', '--config', './test/util/config.js', ...commands], {
        cwd: path.resolve(__dirname, '../..'),
        env: { ...process.env, CLAPPY_UUID: instId }
      });
      proc.stderr.on('data', (data) => {
        errText += data.toString('utf8');
      });
      proc.stdout.on('data', (data) => {
        response += data.toString('utf8');
      });
      proc.on('close', async (code) => {
        if (code === 0) {
          requests = await request.get(historyUri, { json: true });
          resolve({ requests, response, resolved: true, error });
        } else {
          requests = await request.get(historyUri, { json: true });
          resolve({ requests, response, resolved, error: errText });
        }
      });
    });
  },


  /* ------------------------------------------------------------------------ *
   * forEach()
   *
   * Synchronously runs callback for all 12 combinations of test apis, envs,
   * and grant types.
   * ------------------------------------------------------------------------ */

  forEach (cb) {
    const apiEnvIds = {
      foo: ['local', 'staging', 'prod'],
      bar: ['local', 'int', 'prod']
    };
    const grantTypes = ['cc', 'pw'];
    for (let apiId in apiEnvIds) {
      for (let envId of apiEnvIds[apiId]) {
        for (let grantType of grantTypes) {
          const prefix = _.padEnd(`${apiId}/${envId}/${grantType}: `, 16);
          cb(apiId, envId, grantType, prefix);
        }
      }
    }
  },


  /* ------------------------------------------------------------------------ *
   * authRequestMatcher()
   *
   * Generates an object that should be a subset of the auth request made to
   * the test server for the given apiId, envId, and grantType.
   * ------------------------------------------------------------------------ */

  authRequestMatcher (apiId, envId, grantType) {
    return {
      originalUrl: `/${apiId}/${envId}/oauth2/auth`,
      method: 'POST',
      body: grantType === 'pw'
        ? {
            client_id: v.get(apiId, envId, 'CLIENT_ID'),
            client_secret: v.get(apiId, envId, 'CLIENT_SECRET'),
            username: v.get(apiId, envId, 'USERNAME'),
            password: v.get(apiId, envId, 'PASSWORD'),
            grant_type: 'password'
          }
        : {
            client_id: v.get(apiId, envId, 'CLIENT_ID'),
            client_secret: v.get(apiId, envId, 'CLIENT_SECRET'),
            grant_type: 'client_credentials'
          },
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'host': 'localhost:7357',
        'user-agent': 'Clappy API Client',
        'x-decoration-key': v.get(apiId, envId, 'DECORATION_KEY')
      }
    };
  },


  /* ------------------------------------------------------------------------ *
   * authRequestMatcher()
   *
   * Generates an object that should be a subset of the api request made to
   * the test server for the given apiId, envId, grantType, and method.
   * ------------------------------------------------------------------------ */

  apiRequestMatcher (apiId, envId, grantType, method) {
    const contentType = ['get','delete'].includes(method)
      ? {}
      : { 'content-type': 'application/json' };
    const token = v.get(apiId, envId, `${grantType}_TOKEN`);
    return {
      originalUrl: `/${apiId}/${envId}/2.0/${v.REQ_PATH}`,
      method: method.toUpperCase(),
      body: ['get','delete'].includes(method) ? {} : v.REQ_BODY,
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${token}`,
        host: 'localhost:7357',
        'user-agent': 'Clappy API Client',
        'x-decoration-key': v.get(apiId, envId, 'DECORATION_KEY'),
        ...contentType
      }
    };
  }
};
