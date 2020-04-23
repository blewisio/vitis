const camelcase = require('camelcase');

const getPluginNames = (args) => {
  const plugins = Object
    .keys(args)
    .map(camelcase);
  const unique = [...new Set(plugins)];
  return unique;
};

module.exports = getPluginNames;
