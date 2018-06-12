const fs = require('fs');

module.exports = function() {

  if (fs.existsSync('platforms/android')) {
    const PERMISSIONS_TO_REMOVE = ['ACCESS_WIFI_STATE', 'WRITE_EXTERNAL_STORAGE'],
    MANIFEST = 'platforms/android/AndroidManifest.xml',
    manifestLines = fs.readFileSync(MANIFEST).toString().split('\n'),
    newManifestLines = [];

    const permissions_regex = PERMISSIONS_TO_REMOVE.join('|');

    manifestLines.forEach(function(line) {
      if (!line.match(permissions_regex)) {
        newManifestLines.push(line);
      }
    });

    fs.writeFileSync(MANIFEST, newManifestLines.join('\n'));
  }

};
