/* application entry point */

'use strict';

function main() {

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
