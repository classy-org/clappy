'use strict';

const _ = require('lodash');
const state = require('../state');
const unquote = require('./unquote');

const ESCAPE = /\\/;
const BINDER = /[`'"]/;
const CPT_DELIMITER = / /;
const CMD_DELIMITER = /[;\n]/;

/* -------------------------------------------------------------------------- *
 * parseProgram
 *
 * Converts a "program" (a string representing one or more commands and their
 * arguments) into a "command queue", an array of command component arrays.
 * -------------------------------------------------------------------------- */

module.exports = function parseProgram(input) {

  const commands = [];
  commands.components = [];
  commands.currentCpt = [];
  commands.context = [];

  return _(input.trim()).split('').reduce((acc, char, i) => {

    const { components, currentCpt, context } = acc;
    const lastContext = _.last(context);
    const isFinalChar = (i === input.trim().length - 1);

    const pushCpt = () => {
      components.push(unquote(currentCpt.join('')));
      currentCpt.length = 0;
    }

    const pushCmd = () => {
      pushCpt();
      const [cmdRoot, ...args] = components;
      if (cmdRoot in state.commandAliases) {
        const aliasedRoot = state.commandAliases[cmdRoot];
        const aliasedCmds = parseProgram([aliasedRoot, ...args].join(' '));
        acc.push(...aliasedCmds);
      } else {
        acc.push([...components]);
      }
      components.length = 0;
    }

    if (ESCAPE.test(lastContext)) {
      currentCpt.push(char);
      context.pop();
    }

    else if (BINDER.test(char)) {
      currentCpt.push(char);
      char === lastContext ? context.pop() : context.push(char);
    }

    else if (CPT_DELIMITER.test(char)) {
      if (context.length) {
        currentCpt.push(char);
      } else if (currentCpt.length) {
        pushCpt();
      }
    }

    else if (CMD_DELIMITER.test(char)) {
      if (context.length) {
        currentCpt.push(char);
      } else {
        pushCmd();
      }
    }

    else {
      acc.currentCpt.push(char);
    }

    if (isFinalChar) {
      pushCmd();
    }

    return acc;

  }, commands);
}
