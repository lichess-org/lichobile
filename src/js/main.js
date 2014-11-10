/* application entry point */

var m = require('mithril');
var play = require('./play');
var storage = require('./storage');

function main() {
  m.route(document.body, '/', {
    '/': play,
    '/:id': play,
  });

  var currGameUrl = storage.get('currentGame.round.url');
  if (currGameUrl) {
    m.route(currGameUrl);
  }

  document.body.addEventListener('submit', function (e) {
    e.preventDefault();
  });

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
