/* application entry point */

window.m = require('mithril');

var home = require('./ui/home');
var play = require('./ui/play');
var utils = require('./utils');
var session = require('./session');

function main() {

  m.route(document.body, '/', {
    '/': home,
    '/play/:id': play
  });

  if (utils.hasNetwork()) session.refresh(true);

  document.addEventListener('backbutton', function () {
    // todo
    window.navigator.app.exitApp();
  }, false);

  if (window.cordova) {
    setTimeout(function() {
      window.navigator.splashscreen.hide();
    }, 2000);
  }
}

window.document.addEventListener(window.cordova ? 'deviceready' : 'DOMContentLoaded', main, false);
