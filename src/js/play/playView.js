var roundView = require('../round/view/main');
var layout = require('../layout');
var menu = require('../menu');
var overlay = require('./overlay');
var utils = require('../utils');

module.exports = function(ctrl) {
  function header() {
    var children = [
      m('nav', [
        m('a.fa.fa-navicon', { config: utils.ontouchstart(ctrl.menu.toggle) }),
        m('h1', ctrl.title()),
        m('a.fa.fa-trophy', {
          config: utils.ontouchstart(overlay.open)
        })
      ])
    ];

    if (ctrl.playing())
      children.push(roundView.renderOpponent(ctrl.round));
    else
      children.push(m('section.opponent', [m('div.infos')]));

    return children;
  }

  function board() {
    if (ctrl.playing())
      return roundView.renderBoard(ctrl.round);
    else
      return roundView.renderBoard(ctrl);
  }

  function footer() {
    if (ctrl.playing())
      return [roundView.renderPlayer(ctrl.round)];
    else
      return [m('section.player', [m('div.infos')])];
  }

  function overlayContent() {
    return [
      m('div.card.new-game',{class:ctrl.swapped?'back_visible':''}, [
        m('div.container_flip', [
          m('div.front',{config:utils.ontouchstart(ctrl.swap)}, [
            m('div.board'),
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
  }

  return layout(ctrl, header, board, footer, menu.view, utils.partial(overlay.view, overlayContent));
};
