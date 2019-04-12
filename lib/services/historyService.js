'use strict';

const _ = require('lodash');
const moment = require('moment');
const state = require('../state');

/* -------------------------------------------------------------------------- *
 * historyService
 *
 * Manages logging and metadata of transactions, filters, and commands.
 * -------------------------------------------------------------------------- */

class HistoryService {

  /* ------------------------------------------------------------------------ *
   * Records a request-response entry in the log and updates the index to
   * point to it.
   * ------------------------------------------------------------------------ */

  logTransaction (request, response) {
    const entry = {
      id: state.transactionLog.length + 1,
      started: response.timingStart,
      elapsed: response.elapsedTime,
      api: state.apiId,
      env: state.envId,
      request,
      response
    }
    state.transactionLog.push(entry);
    state.index = state.transactionLog.length - 1;
    return entry;
  }


  /* ------------------------------------------------------------------------ *
   * Returns the most recent transaction.
   * ------------------------------------------------------------------------ */

  get latestTransaction () {
    return _.last(state.transactionLog);
  }


  /* ------------------------------------------------------------------------ *
   * Records a command.
   * ------------------------------------------------------------------------ */

  logCommand (command) {
    state.commandLog.push(command);
  }


  /* ------------------------------------------------------------------------ *
   * Returns the most recent command.
   * ------------------------------------------------------------------------ */

  get latestCommand () {
    return _.last(state.commandLog);
  }


  /* ------------------------------------------------------------------------ *
   * Records a filter.
   * ------------------------------------------------------------------------ */

  logFilter (filter) {
    state.filterLog.push(filter);
  }


  /* ------------------------------------------------------------------------ *
   * Returns the most recent filter.
   * ------------------------------------------------------------------------ */

  get latestFilter () {
    return _.last(state.filterLog);
  }


  /* ------------------------------------------------------------------------ *
   * Validates and converts a descriptor ("latest", "this", "prev", "next",
   * -2, 10, etc.) to an entry id.
   * ------------------------------------------------------------------------ */

  resolve (descriptor='current') {
    const index = resolveIndex(descriptor);
    assertValidIndex(index);
    return index + 1;
  }


  /* ------------------------------------------------------------------------ *
   * Returns the entry corresponding to the provided entry id.
   * ------------------------------------------------------------------------ */

  get (txnId) {
    return state.transactionLog[txnId - 1];
  }


  /* ------------------------------------------------------------------------ *
   * Updates the index to point to the provided entry id.
   * ------------------------------------------------------------------------ */

  go (txnId) {
    state.index = txnId - 1;
  }


  /* ------------------------------------------------------------------------ *
   * Returns an array of text representations of log entries.
   * ------------------------------------------------------------------------ */

  list () {
    return state.transactionLog.map(this.transactionSlug);
  }


  /* ------------------------------------------------------------------------ *
   * Returns a one-line string summarizing a transaction entry.
   * ------------------------------------------------------------------------ */

  transactionSlug (entry) {
    const { id } = entry;
    const { statusCode } = entry.response;
    const { href } = entry.response.request.uri;
    return `[${id}] ${href} - ${statusCode}`;
  }


  /* ------------------------------------------------------------------------ *
   * Returns a multiline string summarizing a filtered transaction entry.
   * ------------------------------------------------------------------------ */

  transactionMeta (entry, isFull, filter) {
    const { id, api, startedAt, env, request } = entry;
    const dts = moment(startedAt).format('dddd YYYY/MM/DD h:mm:ss A');
    const rule = _.repeat('═', Math.min(50, process.stdout.columns));
    const pathStr = filter && isFull ? filter
      : isFull ? '.'
      : !filter || filter === '.' ? '.body'
      : _.startsWith(filter, '.[') ? `.body${filter.substr(1)}`
      : _.startsWith(filter, '.') ? `.body${filter}`
      : `.body|${filter}`;
    return `\
${rule}
ID   : ${id}
DATE : ${dts}
API  : ${api}
ENV  : ${env}
REQ  : ${request.method} ${request.url}
PATH : ${pathStr}
${rule}`;
  }


  /* ------------------------------------------------------------------------ *
   * Returns the length of the current log.
   * ------------------------------------------------------------------------ */

  get length () {
    return state.transactionLog.length;
  }


  /* ------------------------------------------------------------------------ *
   * Returns true if index is on first entry.
   * ------------------------------------------------------------------------ */

  get atFirst () {
    return state.index === 0;
  }


  /* ------------------------------------------------------------------------ *
   * Returns true if index is on most recent entry.
   * ------------------------------------------------------------------------ */

  get atLatest () {
    return state.index === state.transactionLog.length - 1;
  }


  /* ------------------------------------------------------------------------ *
   * Returns true if log is empty.
   * ------------------------------------------------------------------------ */

  get isEmpty () {
    return state.transactionLog.length === 0;
  }
}


function resolveIndex (descriptor) {
  const log = state.transactionLog;
  const index = state.index;

  // List item - should match format of transactionSlug above
  if (/^\[\d+\]/.test(descriptor)) {
    return _.parseInt(descriptor.match(/^\[(\d+)\]/)[1]) - 1;
  }

  if (descriptor === 'latest') {
    return log.length - 1;
  }

  if (descriptor === 'this' || descriptor === 'current') {
    return index;
  }

  if (descriptor === 'prev') {
    return index - 1;
  }

  if (descriptor === 'next') {
    return index + 1;
  }

  if (descriptor in state.transactionAliases) {
    return resolveIndex(state.transactionAliases[descriptor]);
  }

  const numDescriptor = Number(descriptor);

  if (_.isNaN(numDescriptor) || !_.isInteger(numDescriptor)) {
    throw new Error(`Could not resolve "${descriptor}" to an entry; please try again.`);
  }

  if (numDescriptor < 0) {
    return (state.transactionLog.length - 1) + numDescriptor;
  }

  return numDescriptor - 1;
}

function assertValidIndex (index) {
  const log = state.transactionLog;
  if (!log.length) {
    throw new Error('Please make a transaction and try again.');
  }
  if (index < 0) {
    throw new Error('Invalid transaction descriptor; please try again.');
  }
  if (index >= log.length) {
    throw new Error('Invalid transaction descriptor; please try again.');
  }
  return true;
}

module.exports = new HistoryService();
