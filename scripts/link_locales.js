var fs = require('fs');

var source = 'node_modules/moment/locale';
var dest = 'www/locale';

function recreateLink() {
  // might have broken link
  if (fs.existsSync(dest)) {
    fs.unlinkSync(dest);
  }
  fs.symlinkSync('../' + source, dest);
}

module.exports = function() {

  if (fs.existsSync(source)) {
    if (!fs.existsSync(dest)) {
      recreateLink();
    }
    else if (!fs.existsSync(dest + '/fr.js')) {
      recreateLink();
    }
  }

  if (!fs.existsSync(dest + '/fr.js')) {
    console.error('\x1b[31m%s\x1b[0m', 'Something went wrong with locales symlink. Exiting...');
    process.exit(1);
  }
};
