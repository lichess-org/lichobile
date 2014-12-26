var utils = require('../utils');
var xhr = require('../xhr');
var settings = require('../settings');
var iScroll = require('iscroll');
var session = require('../session');
var gamesMenu = {};

var isOpen = false;
var newGameCardSwapped = false;

gamesMenu.open = function() {
  isOpen = true;
};

gamesMenu.close = function() {
  isOpen = false;
};

gamesMenu.joinGame = function(id) {
  m.route('/play/' + id);
};

gamesMenu.startAIGame = function() {
  xhr.newAiGame().then(function(data) {
    m.route('/play' + data.url.round);
  }, function(error) {
    utils.handleXhrError(error);
  });
};

gamesMenu.seekHumanGame = function() {
  xhr.seekGame().then(function() {
    m.route('/seek');
  }, function(error) {
    utils.handleXhrError(error);
  });
};

function swapCard() {
  newGameCardSwapped = !newGameCardSwapped;
}

function renderRadio(label, name, value, settingsProp) {
  var isOn = settingsProp() === value;
  var id = name + value;
  return [
    m('input.radio[type=radio]', {
      name: name,
      id: id,
      'class': value,
      value: value,
      checked: isOn,
      onchange: function(e) {
        settingsProp(e.target.value);
      }
    }),
    m('label', { 'for': id }, label)
  ];
}

function renderOption(label, value, storedValue) {
  return m('option', {
    value: value,
    selected: storedValue === value
  }, label);
}

function renderSelect(label, name, options, settingsProp, isDisabled) {
  var storedValue = settingsProp();
  return [
    m('label', { 'for': name }, label),
    m('select', {
      name: name,
      disabled: isDisabled,
      onchange: function(e) { settingsProp(e.target.value); }
    }, options.map(function(e) {
      return renderOption(e[0], e[1], storedValue); })
    )
  ];
}

function tupleOf(x) {
  return [x, x];
}

var humanVariants = [['Standard', '1'], ['Chess960', '2'], ['King of the hill', '4'], ['Antichess', '6']];
var aiVariants = [['Standard', '1'], ['Chess960', '2'], ['King of the hill', '4']];

function renderForm(action, settingsObj, variants) {
  var timeMode = settingsObj.timeMode();
  var hasClock = timeMode === '1';
  // var hasCorresp = timeMode === '2';

  var generalFieldset = [
    m('div.select_input',[
      renderSelect('Color:', 'color', [
        ['White', 'white'], ['Black', 'black'], ['Random', 'random']
      ], settingsObj.color),
    ]),
    m('div.select_input', [
      renderSelect('Variant:', 'variant', variants, settingsObj.variant),
    ])
  ];
  if (settingsObj.level) {
    generalFieldset.push(m('div.select_input', [
      renderSelect('Level:', 'ailevel', [
        '1', '2', '3', '4', '5', '6', '7', '8'
        ].map(tupleOf), settingsObj.level)
    ]));
  }
  if (settingsObj.mode) {
    generalFieldset.push(m('div.select_input', [
      renderSelect('Mode:', 'mode', [
        ['Casual', '0'], ['Rated', '1']
      ], settingsObj.mode)
    ]));
  }

  var timeFieldset = [
    m('div.select_input', [
      renderSelect('Time mode:', 'timeMode', [
        ['Unlimited', '0'], ['Clock', '1']
      ], settingsObj.timeMode)
    ])
  ];
  if (settingsObj.time && settingsObj.increment && hasClock) {
    timeFieldset.push(
      m('div.select_input.inline', [
        renderSelect('Time:', 'time', [
          '2', '5', '10', '30', '60'
          ].map(tupleOf), settingsObj.time, false)
      ]),
      m('div.select_input.inline', [
        renderSelect('Increment:', 'increment', [
          '0', '1', '2', '3', '5', '10'
          ].map(tupleOf), settingsObj.increment, false)
      ])
    );
  }
  if (settingsObj.timePreset && hasClock) {
    timeFieldset.push(m('div.select_input', [
      renderSelect('Time|increment:', 'timepreset', [
        '3+0', '3+2', '5+0', '5+3', '10+0', '30+0'
        ].map(tupleOf), settingsObj.timePreset, false)
    ]));
  }
  // if (hasCorresp) {
  //   timeFieldset.push(m('div.select_input', [
  //     renderSelect('Days per turn:', 'days', [
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
      m('div.nice-radio', renderRadio('Human', 'selected', 'human', settings.newGame.selected)),
      m('div.nice-radio', renderRadio('Computer', 'selected', 'computer', settings.newGame.selected))
    ]),
    m('fieldset', generalFieldset),
    m('fieldset#clock', timeFieldset),
    m('button', 'Valider')
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
    return m('div', { style: { height: cDim.innerW + 'px' }}, [
      utils.viewOnlyBoard(fen, lastMove, color)
    ]);
  }

  var nowPlaying = session.isConnected() ? session.get().nowPlaying : [];
  if (nowPlaying === undefined) nowPlaying = [];
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

  var allGames = nowPlaying.map(function(g) {
    return m('div.card.standard', {
      style: cardStyle
    }, [
      renderViewOnlyBoard(g.fen, g.lastMove.match(/.{2}/g), g.color),
      m('div.infos', [
        m('div.icon-game.' + g.variant),
        m('div.description', [
          m('h2.title', g.variant),
          m('p', 'Contre ' + g.opponent.username),
          m('button', {
            config: utils.ontouchendScroll(function() {
              gamesMenu.joinGame(g.id);
              gamesMenu.close();
            })
          }, 'Reprendre la partie')
        ])
      ])
    ]);
  });

  var newGame = m('div.card.new-game', {
    class: newGameCardSwapped ? 'back_visible' : '',
    style: cardStyle,
  }, [
    m('div.container_flip', [
      m('div.front', [
        renderViewOnlyBoard(),
        m('div.infos',[
          m('div.description',[
            m('h2.title', 'New Game'),
            m('p', 'Lancer une nouvelle partie'),
            m('button', { config: utils.ontouchendScroll(swapCard) }, '+ Nouvelle partie')
          ])
        ])
      ]),
      m('div.back', [
        settings.newGame.selected() === 'human' ?
        renderForm(gamesMenu.seekHumanGame, settings.newGame.human, humanVariants) :
        renderForm(gamesMenu.startAIGame, settings.newGame.ai, aiVariants)
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
    m('div.overlay-close',
      { config: utils.ontouchend(gamesMenu.close) },
    '+'),
    m('div#wrapper_games', {
      config:function(el, isUpdate, context) {
        var scroller = new iScroll(el, {
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

    }, renderAllGames())
  ];

  return m('div#game_menu.overlay.overlay-effect', {
    class: isOpen ? 'open' : '',
  }, children);
};

module.exports = gamesMenu;
