var utils = require('../utils');
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
  newGameCardSwapped = true;
}

gameMenu.view = function() {
  var children = [
    m('div.overlay-close',
      { config: utils.ontouchstart(gameMenu.close) },
    '+'),
    m('div.card.new-game', { class: newGameCardSwapped ? 'back_visible' : '' }, [
      m('div.container_flip', [
        m('div.front',{ config: utils.ontouchstart(swapCard) }, [
          utils.viewOnlyBoard(),
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
          m('form', [
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
                m('label[for=color]', 'Color :'),
                m('select[name=color]', [
                  m('option[value=white]', 'White'),
                  m('option[value=black]', 'Black')
                ])
              ]),
              m('div.select_form',[
                m('label[for=variant]', 'Variant :'),
                m('select[name=variant]', [
                  m('option[value=1]', 'Standard'),
                  m('option[value=2]', '960'),
                  m('option[value=3]', 'King of the hill')
                ])
              ])
            ]),
            m('fieldset#clock', [
              m('div.check_container',[
                m('label[for=clock]', 'Clock :'),
                m('input[type=checkbox][checked=checked][name=clock]', 'Clock'),
              ]),
              m('div.select_form',[
                m('label[for=color]', 'Time | Increment :'),
                m('select[name=time]', [
                  m('option[value="5,0"]', '5|0'),
                  m('option[value="1,0"]', '1|0'),
                  m('option[value="10,0"]', '10|0')
                ])
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
