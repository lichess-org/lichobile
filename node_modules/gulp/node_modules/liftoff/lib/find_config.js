const fs = require('fs');
const path = require('path');
const fileSearch = require('./file_search');

module.exports = function (opts) {
  opts = opts || {};
  var configNameRegex = opts.configNameRegex;
  var configPath = opts.configPath;
  var searchPaths = opts.searchPaths;
  // only search for a config if a path to one wasn't explicitly provided
  if (!configPath) {
    if (!Array.isArray(searchPaths)) {
      throw new Error('Please provide an array of paths to search for config in.');
    }
    if (!configNameRegex) {
      throw new Error('Please provide a configNameRegex to search with');
    }
    configPath = fileSearch(configNameRegex, searchPaths);
  }
  // confirm the configPath exists and return an absolute path to it
  if (fs.existsSync(configPath)) {
    return path.resolve(configPath);
  }
  return null;
};
