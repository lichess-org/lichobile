'use strict';

var Q = require('Q'),
    Qajax = require('qajax'),
    _ = require('lodash'),
    alert = require('./alert');


function errorHandler(xhr) {
  // catch errors globally
  alert.show(
    'warning',
    '<strong>Oops!</strong> we have some connection issues with lichess...'
  );

  // for now just reject the promise
  return Q.reject(xhr);
}

function ajax(options) {
  var defaults = {
    headers: {
      'Accept': 'application/vnd.lichess.v1+json',
      'X-Requested-With': 'XMLHttpRequest'
    }
  };

  options = _.assign(defaults, options);
  options.url = window.apiEndPoint + options.url;

  return Qajax(options)
    .then(Qajax.filterSuccess)
    .then(Qajax.toJSON, errorHandler);
}

module.exports = ajax;
