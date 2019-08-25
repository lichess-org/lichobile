var fs = require('fs');

const configXmlFile = 'config.xml';

const configXmlText = fs.readFileSync(configXmlFile).toString();

// when this script is executed (by npm-version) the new version is accessible
// in package.json
const newVersion = require('../package.json').version;
const newVersionParts = newVersion.split('.')
const newVersionCode =
  newVersionParts[0].padEnd(2, 0) +
  newVersionParts.slice(1).map(p => p.padStart(2, 0)).join('') +
  '9'


let newConfigText = configXmlText.replace(
  /(<widget.+version=")([^"]+)(")/,
  '$1' + newVersion + '$3'
);

newConfigText = newConfigText.replace(
  /(android-versionCode=")([^"]+)(")/,
  '$1' + newVersionCode + '$3'
)

newConfigText = newConfigText.replace(
  /("AppendUserAgent"\svalue="v)([^"]+)(")/,
  '$1' + newVersion + '$3'
)

fs.writeFileSync(configXmlFile, newConfigText);
