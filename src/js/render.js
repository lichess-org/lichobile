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
    top: groundPos.top - 36,
    left: 0
  });
  Zepto('#player-table').css({
    position: 'absolute',
    top: groundPos.top + $ground.height(),
    left: 0
  });

  return Chessground.main($ground[0], cfg);
}

function hideOverlay(id) {
  if (id) Zepto(id).hide();
  else Zepto('.overlay').hide();
}

function showOverlay(id) {
  hideOverlay();
  var groundPos = $ground.position();

  Zepto(id).css({
    height: $ground.height() / 2,
    width: $ground.width() / (8/6),
    top: groundPos.top + $ground.height() * (2/8),
    left: $ground.width() * (1/8)
  }).show();
}

module.exports = {
  ground: ground,
  showOverlay: showOverlay,
  hideOverlay: hideOverlay
};
