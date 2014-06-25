'use strict';

var Chessground = require('./vendor/chessground'),
_ = require('lodash'),
$ = require('./vendor/zepto'),
Elements = require('./elements');

module.exports = function(cfg) {
  var defaults = {
    movable: {
      free: false,
      events: {
        after: function() { }
      }
    }
  };

  _.defaults(defaults, cfg);

  var size = $('body').width() - 5;
  var cHeight = $('body > .content').height();
  var bHeight = size;

  Elements.ground.css({
    position: 'absolute',
    top: (cHeight - bHeight) / 2,
    left: 2,
    width: size,
    height: size
  });

  return Chessground.main(document.getElementById('ground'), cfg);

};

