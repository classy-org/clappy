'use strict';

const _ = require('lodash');

const BINDERS = [`"`, `'`, '`'];
const PATTERNS = BINDERS.map(d => new RegExp(`^${d}(\\\\${d}|[^${d}])*${d}$`));
const INTEGER_PATTERN = /^-?\d+$/;

/* -------------------------------------------------------------------------- *
 * unquote
 *
 * Strips balanced wrapping quotes from a value, if applicable.
 * -------------------------------------------------------------------------- */

module.exports = function unquote (quoted) {
  const idx = _.findIndex(PATTERNS, pattern => pattern.test(quoted));
  const unquoted = idx === -1 ? quoted : unquote(_.trim(quoted, BINDERS[idx]));
  if (unquoted === 'true' || unquoted === 'false') {
    return unquoted === 'true';
  }
  if (INTEGER_PATTERN.test(unquoted)) {
    return _.parseInt(unquoted);
  }
  return unquoted;
}
