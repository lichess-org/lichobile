/* application entry point */

'use strict';

var ctrl = require('./ctrl');
var view = require('./view');
var m = require('mithril');

function main() {
  m.module(document.querySelector('body'), {
    controller: ctrl,
    view: view
  });

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
