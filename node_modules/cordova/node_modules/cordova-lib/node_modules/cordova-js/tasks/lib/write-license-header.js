var path        = require('path');
var util        = require('util');
var fs          = require('fs');
var licensePath = path.join(__dirname, '..', 'templates', 'LICENSE-for-js-file.txt');

module.exports = function(outStream, platform, commitId) {
  // some poppycock 
  var licenseText = util.format("/*\n *%s\n */\n", fs.readFileSync(licensePath, 'utf8').replace(/\n/g, "\n *"));

  outStream.write("// Platform: " + platform + "\n", 'utf8');
  outStream.write("// "  + commitId + "\n", 'utf8');
  outStream.write(licenseText, 'utf8');
  outStream.write("var CORDOVA_JS_BUILD_LABEL = '"  + commitId + "';\n", 'utf8');
  outStream.write("var define = {moduleMap: []};\n", 'utf8');

}
