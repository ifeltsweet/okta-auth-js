/* eslint-disable no-console */

require('@okta/env').setEnvironmentVarsFromTestEnv(); // Set environment variables from "testenv" file

const spawn = require('cross-spawn-with-kill');
const waitOn = require('wait-on');
const config = require('../config');

const testName = process.env.SAMPLE_NAME;
let tasks;

function runNextTask() {
  if (tasks.length === 0) {
    console.log('all runs are complete');
    return;
  }
  const task = tasks.shift();
  task().then(() => {
    runNextTask();
  });
}

function runWithConfig(sampleConfig) {
  const { name } = sampleConfig;
  const sampleDir = `../generated/${name}`;
  const port = sampleConfig.port || 8080;

  // 1. start the sample's web server
  const server = spawn('yarn', [
    '--cwd',
    sampleDir,
    'start'
  ], { stdio: 'inherit' });

  waitOn({
    resources: [
      `http-get://localhost:${port}`
    ]
  }).then(() => {
    // 2. run webdriver based on if sauce is needed or not
    let wdioConfig = 'wdio.conf.ts';
    if (process.env.RUN_SAUCE_TESTS) {
      wdioConfig = 'sauce.wdio.conf.js';
    } else if (process.env.RUN_CUCUMBER_TESTS) {
      wdioConfig = 'cucumber.wdio.conf.ts';
    }

    let opts = process.argv.slice(2); // pass extra arguments through
    const runner = spawn('./node_modules/.bin/wdio', [
      'run',
      wdioConfig
    ].concat(opts), { stdio: 'inherit' });

    let returnCode = 1;
    runner.on('exit', function (code) {
      console.log('Test runner exited with code: ', code);
      returnCode = code;
      server.kill();
    });
    runner.on('error', function (err) {
      server.kill();
      throw err;
    });
    server.on('exit', function(code) {
      console.log('Server exited with code: ', code);
      // eslint-disable-next-line no-process-exit
      process.exit(returnCode);
    });
    process.on('exit', function() {
      console.log('Process exited with code: ', returnCode);
    });
  });
}

if (testName) {
  console.log(`Running starting for test "${testName}"`);
  const sampleConfig = config.getSampleConfig(testName);
  if (!sampleConfig) {
    throw new Error('Sample "' + testName + '" does not exist in config');
  }
  console.log('Starting test with config: ', sampleConfig);
  runWithConfig(sampleConfig);
} else {
  // Run all tests
  tasks = [];
  config.getSampleNames().map(sampleName => {
    const sampleConfig = config.getSampleConfig(sampleName);
    if (process.env.RUN_CUCUMBER_TESTS) {
      const features = sampleConfig.features || [];
      if (!features.length) {
        return;
      }
    } else {
      const specs = sampleConfig.specs || [];
      if (!specs.length) {
        return;
      }
    }
    const task = () => {
      return new Promise((resolve) => {
        console.log(`Spawning runner for "${sampleConfig.name}"`);
        let opts = process.argv.slice(2); // pass extra arguments through
        const runner = spawn('node', [
          './runner.js'
        ].concat(opts), { 
          stdio: 'inherit',
          env: Object.assign({}, process.env, {
            'SAMPLE_NAME': sampleConfig.name
          })
        });
        runner.on('error', function (err) {
          throw err;
        });
        runner.on('exit', function(code) {
          if (code !== 0) {
            console.log('Runner exited with code: ' + code);
            // eslint-disable-next-line no-process-exit
            process.exit(code);
          }
          resolve();
        });
      });
    };
    tasks.push(task);
  });
  runNextTask();
}
