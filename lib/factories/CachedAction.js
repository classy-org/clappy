'use strict';

module.exports = class CachedAction {
  constructor (fn, capturedArgs=[]) {
    this.fn = fn;
    this.capturedArgs = capturedArgs;
  }
}
