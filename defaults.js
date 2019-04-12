'use strict';

module.exports = {
  apis: {},
  commandAliases: {},
  enableProdModifications: false,
  filterAliases: {},
  dryRun: false,
  theme: {
    colors: {
      json: {
        attr: 'reset',
        num: 'reset',
        str: 'reset',
        bool: 'reset',
        undef: 'reset',
        null: 'reset',
        regex: 'reset',
        quot: 'reset',
        brack: 'reset',
        punc: 'reset'
      },
      error: 'reset',
      trace: 'reset',
      warn: 'reset',
      meta: 'reset',
      notify: 'reset',
      progress: 'reset',
      result: 'reset'
    },
    showJsonLevels: false,
    showJsonQuotes: true,
    showErrorTrace: false,
    showTransactionMeta: false
  }
};
