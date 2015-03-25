var utils = require('../../utils');
var widgets = require('../widget/common');
var layout = require('../layout');
var menu = require('../menu');

function renderProfile(ctrl) {
  var data = ctrl.getData();
  console.log(JSON.stringify(data));

  return function() {
    m('');
  };
}

module.exports = function(ctrl) {
  var header = utils.partialf(widgets.header, null,
      widgets.backButton(ctrl.getData().username)
    );

  var profile = renderProfile(ctrl);

  return layout.free(header, profile, widgets.empty, menu.view, widgets.empty);
};