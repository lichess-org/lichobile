'use strict';

var Chessground = require('./vendor/chessground'),
_ = require('lodash'),
$ = require('./vendor/zepto');

var $ground = $('#ground');

function ground(cfg) {
  var defaults = {
    movable: {
      free: false,
      events: {
        after: function() { }
      }
    }
  };

  _.defaults(defaults, cfg);

  var size = $('body').width();
  var cHeight = $('body > .content').height();
  var bHeight = size;

  $ground.css({
    position: 'absolute',
    top: (cHeight - bHeight) / 2,
    left: 0,
    width: size,
    height: size
  });

  return Chessground.main($ground[0], cfg);
}

function clocks() {
  var groundPos = $ground.position();
  var leftPos = ($ground.width() - 70) / 2;
  var $topClock = $('#top-clock').css({
    position: 'absolute',
    top: groundPos.top - 25,
    left: leftPos
  });
  var $botClock = $('#bot-clock').css({
    position: 'absolute',
    top: groundPos.top + $ground.height(),
    left: leftPos
  });

  return { top: $topClock, bot: $botClock };
}

module.exports = {
  ground: ground,
  clocks: clocks
};
