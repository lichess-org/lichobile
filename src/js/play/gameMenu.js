var utils = require('../utils');
var settings = require('../settings');
var gameMenu = {};

var isOpen = false;
var newGameCardSwapped = false;

gameMenu.open = function() {
  isOpen = true;
};

gameMenu.close = function() {
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

function renderCheckbox(settingsProp) {
  var isOn = settingsProp();
  return m('input[type=checkbox][name=clock]' + (isOn ? '[checked]' : ''), {
    onchange: function() { settingsProp(!isOn); }
  });
}

function renderOption(label, value, storedValue) {
  return m('option[value=' + value + ']' + (storedValue === value ?  '[selected]' : ''), {
  }, label);
}

function renderSelect(label, name, options, settingsProp, isDisabled) {
  var storedValue = settingsProp();
  return [
    m('label[for=' + name + ']', label),
    m('select[name=' + name + ']' + (isDisabled ? '[disabled]' : ''), {
      onchange: function(e) { settingsProp(e.target.value); }
    }, options.map(function(e) {
      return renderOption(e[0], e[1], storedValue); })
    )
  ];
}

gameMenu.view = function(ctrl) {
  var isClockOff = !settings.newGame.ai.clock();
  var children = [
    m('div.overlay-close',
      { config: utils.ontouchstart(gameMenu.close) },
    '+'),
    m('div.card.new-game', {
      class: newGameCardSwapped ? 'back_visible' : '',
      style: { height: cardHeight() + 'px' }
    }, [
      m('div.container_flip', [
        m('div.front',{ config: utils.ontouchstart(swapCard) }, [
          m('div', { style: { height: boardHeight() + 'px' }}, [
            utils.viewOnlyBoard()
          ]),
          m('div.infos',[
            m('div.description',[
              m('h2.title', 'New Game'),
              m('p', 'Lancer une nouvelle partie'),
              m('button', '+ Nouvelle partie')
            ])
          ])
        ]),
        m('div.back', [
          m('header', 'New Game'),
          m('form.form', {
            onsubmit: function(e) {
              e.preventDefault();
              gameMenu.close();
              swapCard();
              ctrl.startAIGame();
            }
          }, [
            m('fieldset', [
              m('div.nice-radio', [
                m('input#gameHuman.radio.human[type=radio][name=type][value=human]'),
                m('label[for=gameHuman]', 'Human')
              ]),
              m('div.nice-radio', [
                m('input#gameComputer.radio.computer[type=radio][name=type][value=computer][checked=checked]'),
                m('label[for=gameComputer]', 'Computer')
              ])
            ]),
            m('fieldset', [
              m('div.select_form',[
                renderSelect('Color:', 'color', [
                  ['White', 'white'], ['Black', 'black'], ['Random', 'random']
                ], settings.newGame.ai.color),
              ]),
              m('div.select_form', [
                renderSelect('Variant:', 'variant', [
                  ['Standard', '1'], ['Chess 960', '2'], ['King of the hill', '4']
                ], settings.newGame.ai.variant),
              ])
            ]),
            m('fieldset#clock', [
              m('div.check_container',[
                m('label[for=clock]', 'Clock:'),
                renderCheckbox(settings.newGame.ai.clock),
              ]),
              m('div.select_form.inline' + (isClockOff ? '.disabled' : ''),[
                renderSelect('Time:', 'time', [
                  ['5', '5'], ['10', '10'], ['30', '30']
                ], settings.newGame.ai.time, isClockOff)
              ]),
              m('div.select_form.inline' + (isClockOff ? '.disabled' : ''),[
                renderSelect('Increment:', 'increment', [
                  ['0', '0'], ['1', '1'], ['3', '3']
                ], settings.newGame.ai.increment, isClockOff)
              ])
            ]),
            m('button', 'Valider')
          ])
        ])
      ])
    ])

  ];
  return m('div#game_menu.overlay.overlay-effect', {
    class: isOpen ? 'open' : '',
  }, children);
};

module.exports = gameMenu;
