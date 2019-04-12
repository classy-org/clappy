'use strict';

module.exports = {
  json: {
    attr: ['dim', 'black'],
    num: 'blue',
    str: 'red',
    bool: 'blue',
    undef: 'black',
    null: ['bold', 'black'],
    regex: 'cyan',
    quot: ['dim', 'black'],
    brack: ['dim', 'black'],
    punc: ['dim', 'black']
  },
  error: ['bold', 'red'],
  trace: ['dim', 'black', 'italic'],
  warn: ['bold', 'yellow'],
  progress: 'green',
  notify: ['dim', 'black', 'italic'],
  meta: ['dim', 'black'],
  result: 'black'
};
