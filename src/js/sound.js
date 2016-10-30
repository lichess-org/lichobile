import settings from './settings';

var shouldPlay;

var lla, media;

if (window.cordova.platformId === 'ios')
  media = {
    move: 'sounds/move.aifc',
    capture: 'sounds/capture.aifc',
    explosion: 'sounds/explosion.aifc',
    lowtime: 'sounds/lowtime.aifc',
    dong: 'sounds/dong.aifc',
    berserk: 'sounds/berserk.aifc',
    clock: 'sounds/clock.aifc'
  };
else
  media = {
    move: 'sounds/move.mp3',
    capture: 'sounds/capture.mp3',
    explosion: 'sounds/explosion.mp3',
    lowtime: 'sounds/lowtime.mp3',
    dong: 'sounds/dong.mp3',
    berserk: 'sounds/berserk.mp3',
    clock: 'sounds/clock.mp3'
  };



document.addEventListener('deviceready', function() {

  shouldPlay = settings.general.sound();

  if (window.hotjs) {
    window.hotjs.Audio.init();
    lla = window.hotjs.Audio;
  } else {
    lla = window.plugins.LowLatencyAudio;
  }

  lla.preloadFX('move', media.move, function() {}, function(err) {
    console.log(err);
  });
  lla.preloadFX('capture', media.capture, function() {}, function(err) {
    console.log(err);
  });
  lla.preloadFX('explosion', media.explosion, function() {}, function(err) {
    console.log(err);
  });
  lla.preloadFX('lowtime', media.lowtime, function() {}, function(err) {
    console.log(err);
  });
  lla.preloadFX('dong', media.dong, function() {}, function(err) {
    console.log(err);
  });
  lla.preloadFX('berserk', media.berserk, function() {}, function(err) {
    console.log(err);
  });
  lla.preloadFX('clock', media.clock, function() {}, function(err) {
    console.log(err);
  });
}, false);


export default {
  move: function() {
    if (shouldPlay) lla.play('move');
  },
  capture: function() {
    if (shouldPlay) lla.play('capture');
  },
  explosion: function() {
    if (shouldPlay) lla.play('explosion');
  },
  lowtime: function() {
    if (shouldPlay) lla.play('lowtime');
  },
  dong: function() {
    if (shouldPlay) lla.play('dong');
  },
  berserk: function() {
    if (shouldPlay) lla.play('berserk');
  },
  clock: function() {
    if (shouldPlay) lla.play('clock');
  },
  onSettingChange: function(v) {
    shouldPlay = v;
  }
};
