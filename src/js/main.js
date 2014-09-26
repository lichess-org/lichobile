/* application entry point */

'use strict';

var ctrl = require('./ctrl');
var view = require('./view');
var m = require('mithril');

function main() {
  var controller = new ctrl();
  m.module(document.querySelector('body'), {
    controller: function () { return controller; },
    view: view
  });

  (function() {
    var size = (window.innerWidth) + 'px';
    setTimeout(function() {
      document.querySelector('.chessground').style.width = size;
      document.querySelector('.chessground').style.height = size;
    }, 50);
  })();

  document.body.addEventListener('submit', function (e) {
    e.preventDefault();
  });

  document.addEventListener('backbutton', function (e) {
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
