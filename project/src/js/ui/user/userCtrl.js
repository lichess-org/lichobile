var utils = require('../../utils');
var xhr = require('../../xhr');

module.exports = function() {
  var userData;

  xhr.user(m.route.param('id')).then(function(data) {
    userData = data;
  }, function(error) {
    utils.handleXhrError(error);
    m.route('/friends');
  });

  return {
    getData: function() {
      return userData;
    }
  };
};