'use strict';

var Zepto = require('./vendor/zepto');
var chessground = require('chessground');

var $ground = Zepto('#ground');

function ground(cfg) {

  var size = Zepto('body').width();

  $ground.css({
    width: size,
    height: size
  });

  return chessground.main($ground[0], cfg);
}

function hideOverlay(id) {
  if (id) Zepto(id).hide();
  else Zepto('.overlay').hide();
}

function showOverlay(id) {
  hideOverlay();
  var groundPos = $ground.offset();

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
