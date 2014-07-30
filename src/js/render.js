'use strict';

var Chessground = require('./vendor/chessground'),
_ = require('lodash'),
Zepto = require('./vendor/zepto');

var $ground = Zepto('#ground');

function ground(cfg) {

  cfg = _.assign({movable: {free: false}}, cfg);

  var size = Zepto('body').width();
  var cHeight = Zepto('body > .content').height();
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
  var $topClock = Zepto('#top-clock').css({
    position: 'absolute',
    top: groundPos.top - 25,
    left: leftPos
  });
  var $botClock = Zepto('#bot-clock').css({
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
