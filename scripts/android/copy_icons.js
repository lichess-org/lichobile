const ncp = require('ncp').ncp;
const source = 'res/android/onesignal';
const destination = 'platforms/android/app/src/main/res';

module.exports = function() {

  ncp(source, destination, function(err) {
    if (err) {
      return console.error(err);
    }
    return console.log('done');
  });

};
