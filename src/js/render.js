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
  }).show();
  Zepto('#player-table').css({
    position: 'absolute',
    top: groundPos.top + $ground.height(),
    left: 0
  }).show();

  return Chessground.main($ground[0], cfg);
}

module.exports = {
  ground: ground
};
