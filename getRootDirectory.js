const upath = require('upath');

// p is a path
const directoryUp = (p) => {
  const parts = upath.normalize(p).split('/');
  parts.pop();
  return parts.join('/');
};

// p is a path
const fileOrDirectoryName = (p) => {
  const parts = p.split('/');
  return parts.pop();
};

// p is a path
// only works for files in root directory
const getRootDirectory = (p) => fileOrDirectoryName(directoryUp(p));

module.exports = getRootDirectory;
