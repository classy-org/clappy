'use strict';

module.exports = {
  json: {
    attr: 'gray',
    num: 'cyan',
    str: 'redBright',
    bool: 'cyan',
    undef: ['white', 'bold'],
    null: ['white', 'bold'],
    regex: 'cyan',
    quot: 'gray',
    brack: 'gray',
    punc: 'gray'
  },
  error: ['bold', 'redBright'],
  trace: ['gray', 'italic'],
  warn: ['bold', 'yellowBright'],
  progress: 'green',
  notify: ['gray', 'italic'],
  meta: 'gray',
  result: 'white'
};
