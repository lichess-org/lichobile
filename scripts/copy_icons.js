var ncp = require('ncp').ncp;
var source = 'res/android/onesignal';
var destination = 'platforms/android/res';

module.exports = function() {

  ncp(source, destination, function(err) {
    if (err) {
      return console.error(err);
    }
    return console.log('done');
  });

};
