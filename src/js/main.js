/* application entry point */

// mithril exposes already m function in window
require('mithril');

var play = require('./play');
var session = require('./session');

function main() {
  m.route(document.body, '/play', {
    '/play': play,
    '/play/:id': play
  });

  session.refresh();

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
