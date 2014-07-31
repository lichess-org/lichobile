'use strict';

var Chessground = require('./vendor/chessground'),
Zepto = require('./vendor/zepto');

var $ground = Zepto('#ground');

function ground(cfg) {

  var size = Zepto('body').width();
  var cHeight = Zepto('body > .content').height();
  var bHeight = size;
  var groundPos;

  $ground.css({
    position: 'absolute',
    top: (cHeight - bHeight) / 2,
    left: 0,
    width: size,
    height: size
  });

  groundPos = $ground.position();

  Zepto('#opp-table').css({
    position: 'absolute',
    top: groundPos.top - 40,
    left: 0
  });
  Zepto('#player-table').css({
    position: 'absolute',
    top: groundPos.top + $ground.height(),
    left: 0
  });

  return Chessground.main($ground[0], cfg);
}

module.exports = {
  ground: ground
};
