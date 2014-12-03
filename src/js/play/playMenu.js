var utils = require('../utils');
var settings = require('../settings');
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

function renderCheckbox(label, name, settingsProp) {
  var isOn = settingsProp();
  return [
    m('label', { 'for': name }, label),
    m('input[type=checkbox]', {
      name: name,
      checked: isOn,
      onchange: function() {
        settingsProp(!isOn);
      }
    })
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

function renderForm(action, settingsObj) {
  var isClockOff = !settingsObj.clock();

  var generalFieldset = [
    m('div.select_form',[
      renderSelect('Color:', 'color', [
        ['White', 'white'], ['Black', 'black'], ['Random', 'random']
      ], settingsObj.color),
    ]),
    m('div.select_form', [
      renderSelect('Variant:', 'variant', [
        ['Standard', '1'], ['Chess 960', '2'], ['King of the hill', '4']
      ], settingsObj.variant),
    ])
  ];
  if (settingsObj.level) {
    generalFieldset.push(m('div.select_form', [
      renderSelect('Level:', 'ailevel', [
        ['1', '1'], ['2', '2'], ['3', '3'], ['4', '4'], ['5', '5'],
        ['6', '6'], ['7','7'], ['8','8']
      ], settingsObj.level)
    ]));
  }
  if (settingsObj.mode) {
    generalFieldset.push(m('div.select_form', [
      renderSelect('Mode:', 'mode', [
        ['Casual', '0'], ['Rated', '1']
      ], settingsObj.mode)
    ]));
  }

  var clockFieldset = [
    m('div.check_container',[
      renderCheckbox('Clock:', 'clock', settingsObj.clock)
    ])
  ];
  if (settingsObj.time && settingsObj.increment) {
    clockFieldset.push(
      m('div.select_form.inline' + (isClockOff ? '.disabled' : ''),[
        renderSelect('Time:', 'time', [
          ['5', '5'], ['10', '10'], ['30', '30']
        ], settingsObj.time, isClockOff)
      ]),
      m('div.select_form.inline' + (isClockOff ? '.disabled' : ''),[
        renderSelect('Increment:', 'increment', [
          ['0', '0'], ['1', '1'], ['3', '3']
        ], settingsObj.increment, isClockOff)
      ])
    );
  }
  if (settingsObj.timePreset) {
    clockFieldset.push(m('div.select_form' + (isClockOff ? '.disabled' : ''),[
      renderSelect('Time|increment:', 'timepreset', [
        ['3|0', '3|0'], ['3|2', '3|2'], ['5|0', '5|0'], ['5|3', '5|3'],
        ['10|0', '10|0'], ['30|0']
      ], settingsObj.timePreset, isClockOff)
    ]));
  }

  return m('form.form', {
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
    m('fieldset#clock', clockFieldset),
    m('button', 'Valider')
  ]);
}

playMenu.view = function(ctrl) {
  var children = [
    m('div.overlay-close',
      { config: utils.ontouchstart(playMenu.close) },
    '+'),
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
    ])
  ];

  return m('div#game_menu.overlay.overlay-effect', {
    class: isOpen ? 'open' : '',
  }, children);
};

module.exports = playMenu;
