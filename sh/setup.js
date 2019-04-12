'use strict';

const _ = require('lodash');
const chalk = require('chalk');
const fs = require('fs');
const inquirer = require('inquirer');
const jsome = require('jsome');
const { exec: pack } = require('pkg');
const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const presets = require('../lib/presets');

async function setup () {

  let installBin;
  let makeConfig;
  let isCopy;
  let configPath = path.join(os.homedir(), 'clappy.config.js');

  const answers = {
    colorScheme: null
  };

  const colorSchemeMap = {
    'Two-Tone': 'TWO_TONE',
    'Clappy Light': 'CLAPPY_LIGHT',
    'Clappy Dark': 'CLAPPY_DARK',
    'Monokai-nda Light': 'MONOKAINDA_LIGHT',
    'Monokai-nda Dark': 'MONOKAINDA_DARK',
    'None': null
  };

  const sampleJSON = {
    string: "string",
    number: 1,
    boolean: true,
    null: null,
    array: ["array"],
    object: {
      attr: "value"
    }
  }

  function getSample(preset) {
    jsome.params.lintable = true;
    jsome.colors = presets.colorSchemes[preset].json;
    jsome.level.show = false;
    return jsome.getColoredString(sampleJSON);
  }


  /* ------------------------------------------------------------------------ *
   * Welcome
   * ------------------------------------------------------------------------ */

  console.clear();
  console.log(chalk.bold('Welcome to Clappy!'));
  console.log();
  console.log("Let's get you set up.");


  /* ------------------------------------------------------------------------ *
   * Binaries
   * ------------------------------------------------------------------------ */

  console.log();
  console.log(_.repeat(chalk.dim('-'), process.stdout.columns));
  console.log();
  console.log(chalk.bold(`Would you like to install the Clappy and jq binaries?`));
  console.log(chalk.dim.italic(
`This will let you call Clappy from anywhere on your system,
and also write #!/usr/bin/env clappy scripts for cron jobs
or piping to other shell commands.`
  ));
  console.log();

  installBin = (await inquirer.prompt([{
    message: 'Install?',
    type: 'confirm',
    name: 'answer'
  }])).answer;

  if (installBin) {

    let name, pkgTarget, jqBinary;
    switch (process.platform) {
      case 'darwin':
        name = 'macOS';
        pkgTarget = 'node8-macos-x64';
        jqBinary = './bin/jq-osx-amd64';
        break;
      case 'linux':
        name = 'Linux';
        pkgTarget = 'node8-linux-x64';
        jqBinary = './bin/jq-linux64';
        break;
      default:
        throw new Error('Sorry, your platform is not supported.');
    }

    console.log();
    console.log('Checking for jq ...');

    if (!fs.existsSync('/usr/local/bin/jq')) {
      console.log('Installing jq to /usr/local/bin ...');
      fs.copyFileSync(jqBinary, '/usr/local/bin/jq');
    } else {
      console.log('jq already installed.');
    }

    console.log(`Packaging Clappy for ${name} ...`);

    await new Promise(resolve => {

      const child = spawn(
        './node_modules/pkg/lib-es5/bin.js',
        `. -t ${pkgTarget} -o bin/clappy`.split(' ')
      );

      child.stderr.on('data', console.error);

      child.on('close', (code) => {
        if (code !== 0) {
          console.log('Failed to build binary.');
          process.exit();
        }
        console.log('Installing Clappy to /usr/local/bin ...');
        try {
          fs.copyFileSync('./bin/clappy', '/usr/local/bin/clappy');
          console.log(chalk.green('Successfully installed.'));
          resolve();
        } catch (err) {
          console.log('Failed to copy binary to /usr/local/bin.');
          process.exit(1);
        }
      });
    });

  }


  /* ------------------------------------------------------------------------ *
   * Config
   * ------------------------------------------------------------------------ */

  console.log();
  console.log(_.repeat(chalk.dim('-'), process.stdout.columns));
  console.log();
  console.log(chalk.bold(`Would you like to create a ~/clappy.config.js file?`));
  console.log(chalk.dim.italic(
`A config file must exist before Clappy can be used.
Any settings you choose here can be changed at any time.`
  ));
  console.log();

  makeConfig = (await inquirer.prompt([{
    message: 'Create ~/clappy.config.js?',
    type: 'confirm',
    name: 'answer'
  }])).answer;

  if (makeConfig) {

    if (fs.existsSync(configPath)) {

      console.log();
      console.log(_.repeat(chalk.dim('-'), process.stdout.columns));
      console.log();
      console.log(chalk.bold(
`It looks like you've already got a clappy.config.js file. \
Would you like to replace it, keep both, or cancel?`
      ));
      console.log();

      const action = (await inquirer.prompt([{
        message: 'Select:',
        type: 'list',
        name: 'answer',
        default: 'Two Tone',
        choices: [
          'Replace',
          'Keep both',
          'Cancel'
        ]
      }])).answer;

      if (action === 'Cancel') {
        makeConfig = false;
      }

      if (action === 'Keep both') {
        isCopy = true;
        configPath = path.join(os.homedir(), `clappy.config.js.AUTO-${Date.now()}`);
      }
    }
  }

  if (makeConfig) {
    console.log();
    console.log(chalk.bold(`Which color scheme would you like to use for JSON highlighting?`));
    console.log();
    console.log(chalk.bold('Two-Tone:'));
    console.log();
    console.log(getSample('TWO_TONE'));
    console.log();
    console.log(chalk.bold('Clappy Light:'));
    console.log();
    console.log(getSample('CLAPPY_LIGHT'));
    console.log();
    console.log(chalk.bold('Clappy Dark:'));
    console.log();
    console.log(getSample('CLAPPY_DARK'));
    console.log();
    console.log(chalk.bold('Monokai-nda Light:'));
    console.log();
    console.log(getSample('MONOKAINDA_LIGHT'));
    console.log();
    console.log(chalk.bold('Monokai-nda Dark:'));
    console.log();
    console.log(getSample('MONOKAINDA_DARK'));
    console.log();
    console.log(chalk.bold('None:'));
    console.log();
    console.log(JSON.stringify(sampleJSON, null, 2));
    console.log();

    answers.colorScheme = (await inquirer.prompt([{
      message: 'Select:',
      type: 'list',
      name: 'answer',
      default: 'Two Tone',
      filter: (input) => colorSchemeMap[input],
      choices: [
        'Two-Tone',
        'Clappy Light',
        'Clappy Dark',
        'Monokai-nda Light',
        'Monokai-nda Dark',
        'None'
      ]
    }])).answer;

    const configFile = `\
'use strict';

module.exports = (presets) => ({
  theme: {
    colors: presets.colorSchemes.${answers.colorScheme}
  }
});
`;

    console.log();
    console.log(`Creating ${configPath} ...`);
    fs.writeFileSync(configPath, configFile);

    console.log(chalk.green('Successfully created config file.'));

    if (isCopy) {
      console.log(chalk.dim.italic(
`Note: Your current config file will continue to be used
until the above file is renamed to ~/clappy.config.js.`
      ));
    }
  }

  console.log();
  console.log(_.repeat(chalk.dim('-'), process.stdout.columns));
  console.log();
  console.log(chalk.bold(`You're ready to go!`));
  console.log();
  console.log(`Run "${installBin ? 'clappy' : 'yarn start'}" at the command line to start querying.`);
  console.log();
}

setup();
