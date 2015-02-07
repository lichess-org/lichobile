var compact = require('lodash-node/modern/arrays/compact');
var utils = require('../utils');
var xhr = require('../xhr');
var settings = require('../settings');
var iScroll = require('iscroll');
var session = require('../session');
var i18n = require('../i18n');
var formWidgets = require('./_formWidgets');
var session = require('../session');
var moment = window.moment;

// iScroll instance
var scroller = null;

var gamesMenu = {};

var isOpen = false;
var newGameCardSwapped = false;

var doOpen = function() {
  isOpen = true;
  if (utils.hasNetwork() && session.isConnected()) session.refresh();
};

gamesMenu.openNewGame = function() {
  doOpen();
  newGameCardSwapped = true;
};

gamesMenu.openCurrentGames = function() {
  doOpen();
  setTimeout(function() {
    if (scroller) scroller.goToPage(1, 0);
  }, 200);
};

gamesMenu.open = function() {
  if (session.nowPlaying().length)
    gamesMenu.openCurrentGames();
  else
    gamesMenu.openNewGame();
};

gamesMenu.isOpen = function() {
  return isOpen;
};

gamesMenu.close = function() {
  isOpen = false;
};

gamesMenu.lastJoined = null;

gamesMenu.joinGame = function(g) {
  gamesMenu.lastJoined = g;
  gamesMenu.close();
  m.route('/play/' + g.fullId);
  m.redraw();
};

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

function renderForm(formName, action, settingsObj, variants, timeModes) {
  var timeMode = settingsObj.timeMode();
  var hasClock = timeMode === '1';
  var allowWhite = !settingsObj.mode ||
    settingsObj.mode() === '0' ||
    ['5', '6', '7'].indexOf(settingsObj.variant()) === -1 ||
    settings.game.selected() !== 'human';
  var colors = compact([
    ['randomColor', 'random'],
    allowWhite ? ['white', 'white'] : null,
    ['black', 'black']
  ]);
  var generalFieldset = [
    m('div.select_input', [
      formWidgets.renderSelect('color', formName + 'color', colors, settingsObj.color),
    ]),
    m('div.select_input', [
      formWidgets.renderSelect('variant', formName + 'variant', variants, settingsObj.variant),
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
    var modes = session.isConnected() ? [
      ['casual', '0'],
      ['rated', '1']
    ] : [
      ['casual', '0']
    ];
    generalFieldset.push(m('div.select_input', [
      formWidgets.renderSelect('mode', formName + 'mode', modes, settingsObj.mode)
    ]));
  }

  var timeFieldset = [
    m('div.select_input', [
      formWidgets.renderSelect('clock', formName + 'timeMode', timeModes, settingsObj.timeMode)
    ])
  ];
  if (hasClock) {
    timeFieldset.push(
      m('div.select_input.inline', [
        formWidgets.renderSelect('time', formName + 'time',
          settings.game.availableTimes.map(tupleOf), settingsObj.time, false)
      ]),
      m('div.select_input.inline', [
        formWidgets.renderSelect('increment', formName + 'increment',
          settings.game.availableIncrements.map(tupleOf), settingsObj.increment, false)
      ])
    );
  }

  return m('form#new_game_form.form', {
    onsubmit: function(e) {
      e.preventDefault();
      gamesMenu.close();
      swapCard();
      action();
    }
  }, [
    m('fieldset', [
      m('div.nice-radio', formWidgets.renderRadio('human', 'selected', 'human', settings.game.selected)),
      m('div.nice-radio', formWidgets.renderRadio('computer', 'selected', 'computer', settings.game.selected))
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

  function renderViewOnlyBoard(fen, lastMove, color, variant) {
    return m('div', {
      style: {
        height: cDim.innerW + 'px'
      }
    }, [
      utils.viewOnlyBoard(fen, lastMove, color, variant)
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
    var icon = utils.gameIcon(g);
    return m('div.card.standard.' + g.color, {
      key: 'game.' + g.gameId,
      style: cardStyle,
      config: utils.ontouchendScroll(function() {
        gamesMenu.joinGame(g);
      })
    }, [
      renderViewOnlyBoard(g.fen, g.lastMove, g.color, g.variant),
      m('div.infos', [
        m('div.icon-game', {
          'data-icon': icon ? icon : ''
        }),
        m('div.description', [
          m('h2.title', utils.playerName(g.opponent, false)),
          m('p', [
            g.variant.name,
            m('span.time-indication', timeLeft(g))
          ])
        ])
      ])
    ]);
  });

  var game = m('div.card.new-game', {
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
        settings.game.selected() === 'human' ?
        renderForm(
          'human',
          seekHumanGame,
          settings.game.human,
          settings.game.human.availableVariants,
          settings.game.human.availableTimeModes
        ) :
        renderForm(
          'ai',
          startAIGame,
          settings.game.ai,
          settings.game.ai.availableVariants,
          settings.game.ai.availableTimeModes
        )
      ])
    ])
  ]);

  allGames.unshift(game);

  return m('div#all_games', {
    style: {
      width: wrapperWidth + 'px',
      marginLeft: (cDim.padding * 2) + 'px'
    }
  }, allGames);
}

gamesMenu.view = function() {
  if (!isOpen) return m('div#games_menu.overlay.overlay_fade');
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

  return m('div#games_menu.overlay.overlay_fade.open', children);
};

module.exports = gamesMenu;
