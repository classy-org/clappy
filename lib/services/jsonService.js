'use strict';

const _ = require('lodash');
const jsome = require('jsome');
const jsonDiff = require('json-diff');
const path = require('path');
const { spawn } = require('child_process');
const state = require('../state');

/* -------------------------------------------------------------------------- *
 * jsonService
 *
 * Manages JSON formatting and manipulation.
 * -------------------------------------------------------------------------- */

class JSONService {

  /* ------------------------------------------------------------------------ *
   * format()
   *
   * Convert an object into a formatted JSON string with syntax highlighting.
   * ------------------------------------------------------------------------ */

  format (obj) {
    jsome.params.lintable = state.theme.showJsonQuotes;
    jsome.colors = state.theme.colors.json;
    if (state.theme.showJsonLevels) {
      jsome.level.show = true;
      jsome.level.color = 'dim';
      jsome.level.char = '·';
    } else {
      jsome.level.show = false;
    }
    return jsome.getColoredString(obj);
  }


  /* ------------------------------------------------------------------------ *
   * filter()
   *
   * Transform an entry object using jq, and reformat as JSON if necessary.
   * ------------------------------------------------------------------------ */

  async filter (obj, isFull, expr) {

    while (expr in state.filterAliases) {
      expr = state.filterAliases[expr];
    }

    const subset = isFull ? obj.response : obj.response.body;

    if (expr) {

      const macLoc = path.join(__dirname, '../../bin/jq-osx-amd64');
      const linLoc = path.join(__dirname, '../../bin/jq-linux64');
      const winLoc = path.join(__dirname, '../../bin/jq-win64.exe');

      const location = state.context.isBinary ? 'jq' 
        : process.platform === 'darwin' ? macLoc
        : process.platform === 'linux' ? linLoc
        : process.platform === 'win32' ? winLoc
        : null;

      const args = ['-cn', `${JSON.stringify(subset)} | ${expr}`];

      const opts = { cwd: process.cwd() };

      if (!location) {
        throw new Error('Sorry, jq filtering is not available on your platform.');
      }

      const output = await new Promise((resolve, reject) => {

        let output = '';

        const proc = spawn(location, args, opts);

        proc.stderr.on('data', (data) => {
          reject(new Error('Invalid jq expression; please try again.'));
        });

        proc.stdout.on('data', (data) => {
          output += data.toString('utf8');
        });

        proc.on('close', (code) => {

          if (code !== 0) return;

          try {
            resolve(JSON.parse(output));
          } catch (err) {
            if (state.context.isTTY) {
              resolve(output);
            }
            else {
              const arr = output
                .trim()
                .split(/[\n\r]/g)
                .map(str => JSON.parse(str));
              resolve(arr.length === 1 ? arr[0] : arr);
            }
          }
        });

      });

      return output;
    }

    return subset;
  }


  /* ------------------------------------------------------------------------ *
   * diff()
   *
   * Return the differences between two objects.
   * ------------------------------------------------------------------------ */

  diff (obj1, obj2) {
    return jsonDiff.diff(obj1, obj2);
  }


  /* ------------------------------------------------------------------------ *
   * diffString()
   *
   * Convert two objects into a formatted string highlighting their
   * differences.
   * ------------------------------------------------------------------------ */

  diffString (obj1, obj2) {
    return jsonDiff.diffString(obj1, obj2).trim();
  }


}

module.exports = new JSONService();
