var utils = require('../utils');
var xhr = require('../xhr');
var settings = require('../settings');
var iScroll = require('iscroll');
var session = require('../session');
var i18n = require('../i18n');
var formWidgets = require('./_formWidgets');
var session = require('../session');
var moment = require('moment');

// iScroll instance
var scroller = null;

var gamesMenu = {};

var isOpen = false;
var newGameCardSwapped = false;

gamesMenu.open = function() {
  isOpen = true;
  if (utils.hasNetwork() && session.isConnected()) session.refresh(true);
};

gamesMenu.openNewGame = function() {
  gamesMenu.open();
  newGameCardSwapped = true;
};

gamesMenu.openCurrentGames = function() {
  gamesMenu.open();
  scroller.goToPage(1, 0);
};

gamesMenu.isOpen = function() {
  return isOpen;
};

gamesMenu.close = function() {
  isOpen = false;
};

gamesMenu.joinGame = function(id) {
  m.route('/play/' + id);
};

var variantIconsMap = {
  bullet: 'T',
  blitz: ')',
  classical: '+',
  correspondence: ';',
  chess960: '\'',
  kingOfTheHill: '(',
  threeCheck: '.',
  antichess: '@',
  atomic: '>'
};

function iconFromVariant(variant, perf) {
  var lookup = variant === 'standard' ? perf : variant;
  return variantIconsMap[lookup];
}

function startAIGame() {
  return xhr.newAiGame().then(function(data) {
    m.route('/play' + data.url.round);
  }, function(error) {
    utils.handleXhrError(error);
    throw error;
  });
}

function seekHumanGame() {
  m.route('/seek');
}

function swapCard() {
  newGameCardSwapped = !newGameCardSwapped;
}

function tupleOf(x) {
  return [x, x];
}

function renderForm(action, settingsObj, variants, timeModes) {
  var timeMode = settingsObj.timeMode();
  var hasClock = timeMode === '1';
  // var hasCorresp = timeMode === '2';

  var generalFieldset = [
    m('div.select_input', [
      formWidgets.renderSelect('color', 'color', [
        ['white', 'white'],
        ['black', 'black'],
        ['randomColor', 'random']
      ], settingsObj.color),
    ]),
    m('div.select_input', [
      formWidgets.renderSelect('variant', 'variant', variants, settingsObj.variant),
    ])
  ];
  if (settingsObj.level) {
    generalFieldset.push(m('div.select_input', [
      formWidgets.renderSelect('level', 'ailevel', [
        '1', '2', '3', '4', '5', '6', '7', '8'
      ].map(tupleOf), settingsObj.level)
    ]));
  }
  if (settingsObj.mode) {
    generalFieldset.push(m('div.select_input', [
      formWidgets.renderSelect('mode', 'mode', [
        ['casual', '0'],
        ['rated', '1']
      ], settingsObj.mode)
    ]));
  }

  var timeFieldset = [
    m('div.select_input', [
      formWidgets.renderSelect('clock', 'timeMode', timeModes, settingsObj.timeMode)
    ])
  ];
  if (hasClock) {
    timeFieldset.push(
      m('div.select_input.inline', [
        formWidgets.renderSelect('time', 'time',
          settings.newGame.availableTimes.map(tupleOf), settingsObj.time, false)
      ]),
      m('div.select_input.inline', [
        formWidgets.renderSelect('increment', 'increment',
          settings.newGame.availableIncrements.map(tupleOf), settingsObj.increment, false)
      ])
    );
  }
  // if (hasCorresp) {
  //   timeFieldset.push(m('div.select_input', [
  //     formWidgets.renderSelect('Days per turn:', 'days', [
  //       '1', '2', '3', '5', '7', '10', '14'
  //       ].map(tupleOf), settingsObj.days, false)
  //   ]));
  // }

  return m('form#new_game_form.form', {
    onsubmit: function(e) {
      e.preventDefault();
      gamesMenu.close();
      swapCard();
      action();
    }
  }, [
    m('fieldset', [
      m('div.nice-radio', formWidgets.renderRadio('human', 'selected', 'human', settings.newGame.selected)),
      m('div.nice-radio', formWidgets.renderRadio('computer', 'selected', 'computer', settings.newGame.selected))
    ]),
    m('fieldset', generalFieldset),
    m('fieldset#clock', timeFieldset),
    m('button', i18n('createAGame'))
  ]);
}

function renderAllGames() {

  function cardDims() {
    var vp = utils.getViewportDims();
    var width = vp.vw * 85 / 100;
    var padding = vp.vw * 2.5 / 100;
    return {
      w: width + padding * 2,
      h: width + 144,
      innerW: width,
      padding: padding
    };
  }

  function renderViewOnlyBoard(fen, lastMove, color) {
    return m('div', {
      style: {
        height: cDim.innerW + 'px'
      }
    }, [
      utils.viewOnlyBoard(fen, lastMove, color)
    ]);
  }

  var nowPlaying = session.nowPlaying();
  var cDim = cardDims();
  var cardStyle = {
    width: cDim.w + 'px',
    height: cDim.h + 'px',
    paddingLeft: cDim.padding + 'px',
    paddingRight: cDim.padding + 'px'
  };
  var nbCards = nowPlaying.length + 1;
  // scroller wrapper width
  // calcul is:
  // ((cardWidth + visible part of adjacent card) * nb of cards) +
  //   wrapper's marginLeft
  var wrapperWidth = ((cDim.w + cDim.padding * 2) * nbCards) +
    (cDim.padding * 2);

  var timeLeft = function(g) {
    if (!g.isMyTurn) return i18n('waitingForOpponent');
    if (!g.secondsLeft) return i18n('yourTurn');
    var time = moment().add(g.secondsLeft, 'seconds');
    return m('time', {
      datetime: time.format()
    }, time.fromNow());
  };

  var allGames = nowPlaying.map(function(g) {
    var icon = iconFromVariant(g.variant.key, g.perf);
    return m('div.card.standard.' + g.color, {
      key: 'game.' + g.gameId,
      style: cardStyle,
      config: utils.ontouchendScroll(function() {
        gamesMenu.joinGame(g.fullId);
        gamesMenu.close();
      })
    }, [
      renderViewOnlyBoard(g.fen, g.lastMove.match(/.{2}/g), g.color),
      m('div.infos', [
        m('div.icon-game', {
          'data-icon': icon ? icon : ''
        }),
        m('div.description', [
          m('h2.title', g.name),
          m('p', [
            g.opponent.username,
            m('span.time-indication', timeLeft(g))
          ])
        ])
      ])
    ]);
  });

  var newGame = m('div.card.new-game', {
    key: 'new-game',
    class: newGameCardSwapped ? 'back_visible' : '',
    style: cardStyle
  }, [
    m('div.container_flip', [
      m('div.front', {
        config: utils.ontouchendScroll(swapCard)
      }, [
        renderViewOnlyBoard(),
        m('div.infos', [
          m('div.description', [
            m('h2.title', i18n('createAGame')),
            m('p', i18n('newOpponent')),
          ])
        ])
      ]),
      m('div.back', [
        settings.newGame.selected() === 'human' ?
        renderForm(
          seekHumanGame,
          settings.newGame.human,
          settings.newGame.human.availableVariants,
          settings.newGame.human.availableTimeModes
        ) :
        renderForm(
          startAIGame,
          settings.newGame.ai,
          settings.newGame.ai.availableVariants,
          settings.newGame.ai.availableTimeModes
        )
      ])
    ])
  ]);

  allGames.unshift(newGame);

  return m('div#all_games', {
    style: {
      width: wrapperWidth + 'px',
      marginLeft: (cDim.padding * 2) + 'px'
    }
  }, allGames);
}

gamesMenu.view = function() {
  var children = [
    m('button.overlay_close.fa.fa-close', {
      config: utils.ontouchend(gamesMenu.close)
    }),
    m('div#wrapper_games', {
      config: function(el, isUpdate, context) {
        if (!isUpdate) {
          scroller = new iScroll(el, {
            scrollX: true,
            scrollY: false,
            momentum: false,
            snap: '.card',
            snapSpeed: 400,
            preventDefaultException: {
              tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT|LABEL)$/
            }
          });

          context.onunload = function() {
            if (scroller) {
              scroller.destroy();
              scroller = null;
            }
          };
        }
        // see https://github.com/cubiq/iscroll/issues/412
        scroller.options.snap = el.querySelectorAll('.card');
        scroller.refresh();
      }
    }, renderAllGames())
  ];

  return m('div#games_menu.overlay.overlay_fade', {
    class: isOpen ? 'open' : '',
  }, children);
};

module.exports = gamesMenu;
