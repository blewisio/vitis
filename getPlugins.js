const upath = require('upath');

const getPlugins = (names, pluginsFolder) => {
  return names
    .map(x => ({
      name: x,
      func: require(upath.join(process.cwd(), pluginsFolder, `${x}.js`)),
    }));
};

module.exports = getPlugins;
