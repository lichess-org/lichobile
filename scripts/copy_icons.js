var ncp = require('ncp').ncp;
var source = 'resources/android/res';
var destination = 'platforms/android/res';

module.exports = function() {

  ncp(source, destination, function(err) {
    if (err) {
      return console.error(err);
    }
    return console.log('done');
  });

};
