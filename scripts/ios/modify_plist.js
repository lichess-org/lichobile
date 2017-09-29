const fs = require('fs');

module.exports = function() {
  const plistFile = 'platforms/ios/lichess/lichess-Info.plist';
  const searchedText = 'org.lichess.mobileapp'

  let plistText = fs.readFileSync(plistFile).toString();

  if (plistText.includes(searchedText)) {
    plistText = plistText.replace(searchedText, searchedText + '.official');
  }

  fs.writeFileSync(plistFile, plistText);
};
