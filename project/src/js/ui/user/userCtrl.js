var utils = require('../../utils');
var xhr = require('../../xhr');

var userData = null;

module.exports = function() {
  var userData;

  xhr.user(m.route.param('id')).then(function(data) {
    userData = data;
    m.redraw();
  }, function(error) {
    utils.handleXhrError(error);
    m.route('/friends');
  });

  return {
    getUserData: function() {
      return userData;
    }
  };
};