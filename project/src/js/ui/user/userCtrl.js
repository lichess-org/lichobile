var utils = require('../../utils');
var xhr = require('../../xhr');
var helper = require('../helper')

var userData = null;

module.exports = function() {

  helper.analyticsTrackView('User Profile');

  var userData;

  xhr.user(m.route.param('id')).then(function(data) {
    userData = data;
  }, function(error) {
    utils.handleXhrError(error);
    utils.backHistory();
  });

  return {
    getUserData: function() {
      return userData;
    }
  };
};