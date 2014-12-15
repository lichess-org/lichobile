var utils = require('../utils');
var settings = require('../settings');
var iScroll = require('iscroll');
var playMenu = {};

var isOpen = false;
var newGameCardSwapped = false;

playMenu.open = function() {
  isOpen = true;
};

playMenu.close = function() {
  isOpen = false;
};

function swapCard() {
  newGameCardSwapped = !newGameCardSwapped;
}

// see game.styl for dimensions
function boardHeight() {
  return utils.getViewportDims().vw * 80 / 100;
}

// see game.styl for dimensions
function cardHeight() {
  return boardHeight() + 144;
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
  m('label', { 'for': id }, label) ];
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

function renderForm(action, settingsObj) {
  var timeMode = settingsObj.timeMode();
  var hasClock = timeMode === '1';
  var hasCorresp = timeMode === '2';

  var generalFieldset = [
    m('div.select_input',[
      renderSelect('Color:', 'color', [
        ['White', 'white'], ['Black', 'black'], ['Random', 'random']
      ], settingsObj.color),
    ]),
    m('div.select_input', [
      renderSelect('Variant:', 'variant', [
        ['Standard', '1'], ['Chess 960', '2'], ['King of the hill', '4']
      ], settingsObj.variant),
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
        ['Unlimited', '0'], ['Clock', '1'], ['Correspondance', '2']
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
        '3|0', '3|2', '5|0', '5|3', '10|0', '30|0'
        ].map(tupleOf), settingsObj.timePreset, false)
    ]));
  }
  if (hasCorresp) {
    timeFieldset.push(m('div.select_input', [
      renderSelect('Days per turn:', 'days', [
        '1', '2', '3', '5', '7', '10', '14'
        ].map(tupleOf), settingsObj.days, false)
    ]));
  }

  return m('form#new_game_form.form', {
    onsubmit: function(e) {
      e.preventDefault();
      playMenu.close();
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

playMenu.view = function(ctrl) {
  var children = [
    m('div.overlay-close',
      { config: utils.ontouchstart(playMenu.close) },
    '+'),
    m('div#wrapper-games',{
      config:function(el) {
        var myScroll = new iScroll(el, {
          scrollX: true,
          scrollY:false,
          momentum:false,
          snap:'.card',
          snapSpeed:400,
          keyBindings:true
        });
      }

    },[
      m('div#all-games',[
        m('div.card.new-game', {
          class: newGameCardSwapped ? 'back_visible' : '',
          style: { height: cardHeight() + 'px' }
        }, [
          m('div.container_flip', [
            m('div.front', [
              m('div', { style: { height: boardHeight() + 'px' }}, [
                utils.viewOnlyBoard()
              ]),
              m('div.infos',[
                m('div.description',[
                  m('h2.title', 'New Game'),
                  m('p', 'Lancer une nouvelle partie'),
                  m('button', { config: utils.ontouchstart(swapCard) }, '+ Nouvelle partie')
                ])
              ])
            ]),
            m('div.back', [
              settings.newGame.selected() === 'human' ?
              renderForm(ctrl.seekHumanGame, settings.newGame.human) :
              renderForm(ctrl.startAIGame, settings.newGame.ai)
            ])
          ])
        ]),
        m('div.card.standard',[
          m('div', { style: { height: boardHeight() + 'px' }}, [
            utils.viewOnlyBoard()
          ]),
          m('div.infos',[
            m('div.icon-game.standard',[
              ]),
              m('div.description',[
                m('h2.title', 'New Game'),
                m('p', 'Lancer une nouvelle partie'),
                m('button', { config: utils.ontouchstart(swapCard) }, '+ Nouvelle partie')
              ])
          ])
        ]),
        m('div.card.standard',[
          m('div', { style: { height: boardHeight() + 'px' }}, [
            utils.viewOnlyBoard()
          ]),
          m('div.infos',[
            m('div.icon-game.chess960',[
              ]),
              m('div.description',[
                m('h2.title', 'New Game'),
                m('p', 'Lancer une nouvelle partie'),
                m('button', { config: utils.ontouchstart(swapCard) }, '+ Nouvelle partie')
              ])
          ])
        ])
      ])
    ])
  ];

  return m('div#game_menu.overlay.overlay-effect', {
    class: isOpen ? 'open' : '',
  }, children);
};

module.exports = playMenu;
