'use strict';

const _ = require('lodash');
const actions = require('../actions');
const Cancellation = require('../factories/Cancellation');
const chalk = require('chalk');
const historyService = require('./historyService');
const inquirer = require('inquirer');
const jsonService = require('./jsonService');
const state = require('../state');

/* -------------------------------------------------------------------------- *
 * ttyService
 *
 * Manages command line inputs and outputs.
 * -------------------------------------------------------------------------- */

class TTYService {

  /* ------------------------------------------------------------------------ *
   * write()
   *
   * Colorizes and writes to stdout.
   * ------------------------------------------------------------------------ */

  write (type, data) {
    const colorized = type === 'json'
      ? jsonService.format(data)
      : _.invoke(chalk, state.theme.colors[type], data);
    process.stdout.write(`${colorized}\n`);
  }


  /* ------------------------------------------------------------------------ *
   * output()
   *
   * Interprets and displays command output.
   * ------------------------------------------------------------------------ */

  output ({ progress, notify, entries, result }) {
    if (progress) {
      this.write('progress', progress);
    }
    if (notify) {
      this.write('notify', notify);
    }
    if (entries) {
      if (state.context.mode === 'client' && state.theme.showTransactionMeta) {
        entries.forEach((entry) => {
          this.write('meta', historyService.transactionMeta(entry));
        });
      }
    }
    if (!_.isUndefined(result)) {
      if (_.isObject(result)) {
        this.write('json', result);
      } else {
        this.write('result', result);
      }
    }
  }


  /* ------------------------------------------------------------------------ *
   * error()
   *
   * Write error.
   * ------------------------------------------------------------------------ */

  error (err) {
    this.write('error', `Error: ${err.message}`);
    if (state.theme.showErrorTrace) {
      this.write('trace', err.stack.split('\n').slice(1).join('\n'));
    }
  }


  /* ------------------------------------------------------------------------ *
   * loop()
   *
   * Recursively accept and process commands from the user.
   * ------------------------------------------------------------------------ */

  async loop (cb) {
    const { apiId, envId, grantType } = state;
    const gt = grantType === 'password' ? 'pw' : 'cc';
    const slugId = historyService.length === 0 ? '' : `[${historyService.resolve('current')}]`;
    const slugCtx = apiId && envId ? `(${apiId}/${envId}/${gt})` : '';
    const slug = chalk.bold(`clappy ${[slugId, slugCtx].join(' ').trim()}`.trim());
    const { program } = await inquirer.prompt([{
      message: '>',
      name: 'program',
      type: 'input',
      prefix: slug
    }]);
    try {
      if (program.trim()) {
        await cb(program, false);
      }
    }
    catch (err) {
      if (err instanceof Cancellation) {
        this.write('notify', err.message);
        return;
      }
      this.error(err);
    }
    finally {
      process.stdout.write('\n');
      this.loop(cb);
    }
  }


  /* ------------------------------------------------------------------------ *
   * ask()
   *
   * Prompt the user for a text value.
   * ------------------------------------------------------------------------ */

  async ask ({ message, mask, type }) {
    if (!type) {
      type = mask ? 'password' : 'input';
    }
    const { answer } = await inquirer.prompt([{
      message,
      type,
      name: 'answer',
      prefix: '-',
      mask: '*'
    }]);
    return answer;
  }


  /* ------------------------------------------------------------------------ *
   * askForJson()
   *
   * Prompt the user for a JSON value.
   * ------------------------------------------------------------------------ */

  async askForJson (message, defaultText='') {
    const { json } = await inquirer.prompt([{
      message,
      type: 'editor',
      name: 'json',
      prefix: '-',
      default: defaultText
    }]);
    let obj;
    try {
      obj = JSON.parse(json);
    } catch (err) {
      const tryAgain = await this.ask({
        message: 'Could not parse JSON. Would you like to try again?',
        type: 'confirm'
      });
      if (tryAgain) {
        return await this.askForJson(message, json);
      } else {
        throw new Error('Canceled.');
      }
    }
    this.output({ result: obj });
    const { ok } = await inquirer.prompt([{
      message: 'Look good?',
      type: 'confirm',
      name: 'ok',
      prefix: '-'
    }]);
    if (!ok) {
      return await this.askForJson(message, json);
    }
    return obj;
  }


  /* ------------------------------------------------------------------------ *
   * askForEntry()
   *
   * Prompt the user to select a transaction entry from a list.
   * ------------------------------------------------------------------------ */

  async askForEntry (message) {
    const choices = historyService.list();
    const { answer } = await inquirer.prompt([{
      message,
      type: 'list',
      choices,
      default: historyService.resolve('current') - 1,
      name: 'answer',
      prefix: '-',
    }]);
    return historyService.resolve(answer);
  }


  /* ------------------------------------------------------------------------ *
   * askToModifyProd()
   *
   * Prompt the user to confirm a request that may modify the production
   * environment.
   * ------------------------------------------------------------------------ */

  async askToModifyProd (message) {
    const choices = {
      Cancel: 'cancel',
      Continue: 'continue',
      'Continue and silence warnings': 'silence'
    };
    this.write('warn', [
      'Warning: You are about to modify a resource in the production',
      'environment. Would you like to continue?'
    ].join(' '));
    const { answer } = await inquirer.prompt([{
      message: 'Select action:',
      type: 'list',
      choices: Object.keys(choices),
      default: 'Cancel',
      name: 'answer',
      prefix: '-'
    }]);
    return choices[answer];
  }
}

module.exports = new TTYService();
