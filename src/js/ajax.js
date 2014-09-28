'use strict';

var Q = require('q'),
    Qajax = require('qajax'),
    _ = require('lodash');

var defaults = {
  headers: {
    'Accept': 'application/vnd.lichess.v1+json',
    'X-Requested-With': 'XMLHttpRequest'
  }
};

function errorHandler(xhr) {
  // catch errors globally
  if (xhr.status !== 401) {
  }

  // for now just reject the promise
  return Q.reject(xhr);
}

function ajax(options, noJson) {
  options = _.defaults(_.clone(defaults), options);
  options.url = window.apiEndPoint + options.url;

  if (noJson) return Qajax(options).then(Qajax.filterSuccess).catch(errorHandler);

  return Qajax(options)
    .then(Qajax.filterSuccess)
    .then(Qajax.toJSON, errorHandler);
}

module.exports = ajax;
