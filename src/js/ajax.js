'use strict';

var Q = require('Q'),
    Qajax = require('qajax'),
    _ = require('lodash'),
    alert = require('./alert');

var defaults = {
  headers: {
    'Accept': 'application/vnd.lichess.v1+json',
    'X-Requested-With': 'XMLHttpRequest'
  }
};

function errorHandler(xhr) {
  // catch errors globally
  alert.show(
    'warning',
    '<strong>Oops!</strong> we have some connection issues with lichess...'
  );

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
