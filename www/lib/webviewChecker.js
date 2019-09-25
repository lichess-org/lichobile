// https://github.com/NoNameProvided/cordova-plugin-webview-checker
document.addEventListener('deviceready', function() {

  plugins.webViewChecker.getCurrentWebViewPackageInfo()
  .then(function(pi) {
    var majorVersion = parseInt(pi.versionName.split('.')[0])
    if (majorVersion < 58) {
      navigator.notification.confirm(
        'Lichess needs a recent version of the rendering engine which is provided by the "' + pi.packageName + '" application. The version you\'re using is too old (' + pi.versionName + '). Please update it or lichess might not work.',
        function(button) {
          if (button === 1) {
            plugins.webViewChecker.openGooglePlayPage()
            .then(function() {
            })
            .catch(function(error) {
              console.error(error)
            })
          }
        },
        'Webview update required',
        ['Open Google Play', 'OK']
      )
    }
  })
  .catch(function(error) {
    console.error(error)
  })


}, false)
