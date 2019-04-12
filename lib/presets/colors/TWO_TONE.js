'use strict';

module.exports = {
  json: {
    attr: 'dim',
    num: 'reset',
    str: 'reset',
    bool: 'reset',
    undef: 'reset',
    null: 'reset',
    regex: 'reset',
    quot: 'dim',
    brack: 'dim',
    punc: 'dim'
  },
  error: 'bold',
  trace: 'dim',
  warn: 'bold',
  progress: ['dim', 'italic'],
  notify: ['dim', 'italic'],
  meta: 'dim',
  result: 'reset'
};
