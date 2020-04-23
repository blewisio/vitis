#! /usr/bin/env node
const chalk = require('chalk');
const Table = require('cli-table3');
const yargsParser = require('yargs-parser');
const klaw = require('klaw-sync');
const fs = require('fs-extra');
const yaml = require('js-yaml');
const upath = require('upath');
const getPluginNames = require('./getPluginNames');
const getPlugins = require('./getPlugins');
const getRootDirectory = require('./getRootDirectory');
const log = require('./log');

const DEFAULT_PLUGINS_FOLDER = 'plugins';
const DEFAULT_REPOS_FOLDER = 'repos';

(async () => {
  // get command-line options
  const argv = yargsParser(process.argv.slice(2));

  const {
    _,
    compact,
    json,
    plugins: pluginsFolder = DEFAULT_PLUGINS_FOLDER,
    repos: reposFolder = DEFAULT_REPOS_FOLDER,
    ...args
  } = argv;

  // read plugins
  const names = getPluginNames(args);
  const plugins = getPlugins(names, pluginsFolder);

  if (!plugins.length) {
    console.log('No plugins specified.');
    return;
  }

  // read repos
  const filterNodeModules = x => !x.path.includes('node_modules');
  const path = upath.join(process.cwd(), reposFolder);
  const paths = klaw(path, { filter: filterNodeModules });
  const packages = paths
    .filter(x => x.path.endsWith('package.json'))
    .map(x => x.path)
    .map(x => {
      try {
        return {
          dir: getRootDirectory(x),
          package: require(x),
        };
      } catch (err) {
        return {
          dir: getRootDirectory(x),
        };
      }
    });

  const serverlesses = paths
    .filter(x => x.path.endsWith('serverless.yml') || x.path.endsWith('serverless.yaml'))
    .map(x => x.path)
    .map(x => {
      try {
        return {
          dir: getRootDirectory(x),
          serverless: yaml.safeLoad(fs.readFileSync(x).toString()),
        };
      } catch (err) {
        return {
          dir: getRootDirectory(x),
        };
      }
    });

  // merge all
  const data = {};
  packages.forEach(x => {
    data[x.dir] = {
      package: x.package,
    };
  });
  serverlesses.forEach(x => {
    data[x.dir].serverless = x.serverless;
  });

  // call plugins
  const results = {};
  Object.keys(data).forEach(x => {
    results[x] = {};
  });

  Object.entries(data).forEach(([key, values]) => {
    plugins.forEach(p => {
      try {
        results[key][p.name] = p.func(values);
      } catch (err) {
        results[key][p.name] = chalk.red('err');
      }
    });
  });

  // log results
  if (json) {
    log(JSON.stringify(results, null, 2));
  } else {
    const compactTableOptions = compact
      ? {
        chars: {
          'top': '', 'top-mid': '', 'top-left': '', 'top-right': ''
          , 'bottom': '', 'bottom-mid': '', 'bottom-left': '', 'bottom-right': ''
          , 'left': '', 'left-mid': '', 'mid': '', 'mid-mid': ''
          , 'right': '', 'right-mid': '', 'middle': '  '
        },
        style: { 'padding-left': 0, 'padding-right': 0 }
      }
      : {};
    const table = new Table({
      head: ['directory', ...plugins.map(x => x.name)],
      ...compactTableOptions
    });

    const rows = Object.entries(results).map(([key, values]) => {
      return [key, ...Object.values(values)];
    });

    table.push(...rows);
    console.log(table.toString());
  }
})();
