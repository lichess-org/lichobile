import helper from './helper';
import * as utils from '../utils';
import * as xhr from '../xhr';
import settings from '../settings';
import session from '../session';
import formWidgets from './shared/form';
import popupWidget from './shared/popup';
import i18n from '../i18n';
import backbutton from '../backbutton';
import m from 'mithril';

var newGameForm = {};
newGameForm.isOpen = false;

newGameForm.open = function() {
  helper.analyticsTrackView('New Game Form');
  backbutton.stack.push(newGameForm.close);
  newGameForm.isOpen = true;
};

newGameForm.close = function(fromBB) {
  if (fromBB !== 'backbutton' && newGameForm.isOpen) backbutton.stack.pop();
  newGameForm.isOpen = false;
};

newGameForm.openRealTime = function() {
  settings.game.human.timeMode('1');
  newGameForm.open();
};

newGameForm.openCorrespondence = function() {
  settings.game.selected('human');
  settings.game.human.timeMode('2');
  newGameForm.open();
};

function startAIGame() {
  return xhr.newAiGame().then(function(data) {
    m.route('/game' + data.url.round);
  }, function(error) {
    utils.handleXhrError(error);
    throw error;
  });
}

function seekHumanGame() {
  if (settings.game.human.timeMode() === '1') m.route('/seek');
  else {
    xhr.seekGame();
    m.route('/correspondence');
  }
}

function renderForm(formName, action, settingsObj, variants, timeModes) {
  var timeMode = settingsObj.timeMode();
  var hasClock = timeMode === '1';
  var hasDays = timeMode === '2' && session.isConnected();

  // be sure to set real time clock if disconnected
  if (!session.isConnected()) {
    settings.game.human.timeMode('1');
  }
  if (formName === 'human' && timeMode === '0') {
    settings.game.human.mode('0');
  }

  // both human and AI
  var generalFieldset = [
    m('div.select_input', {
      key: formName + 'variant'
    }, [
      formWidgets.renderSelect('variant', formName + 'variant', variants, settingsObj.variant)
    ])
  ];

  // AI only
  if (settingsObj.color) {
    var colors = [
      ['randomColor', 'random'],
      ['white', 'white'],
      ['black', 'black']
    ];
    generalFieldset.unshift(
      m('div.select_input', {
        key: formName + 'color'
      }, [
        formWidgets.renderSelect('side', formName + 'color', colors, settingsObj.color)
      ])
    );
  }

  // AI only
  if (settingsObj.level) {
    generalFieldset.push(m('div.select_input', {
      key: 'ailevel'
    }, [
      formWidgets.renderSelect('level', 'ailevel', [
        '1', '2', '3', '4', '5', '6', '7', '8'
      ].map(utils.tupleOf), settingsObj.level)
    ]));
  }

  // Human only
  if (settingsObj.mode) {
    var modes = (session.isConnected() && timeMode !== '0') ? [
      ['casual', '0'],
      ['rated', '1']
    ] : [
      ['casual', '0']
    ];
    generalFieldset.push(m('div.select_input', {
      key: formName + 'mode'
    }, [
      formWidgets.renderSelect('mode', formName + 'mode', modes, settingsObj.mode)
    ]));

    if (session.isConnected() && settingsObj.mode() === '1') {
      generalFieldset.push(
        m('div.rating_range', {
          key: 'rating_range'
        }, [
          m('div.title', i18n('ratingRange')),
          m('div.select_input.inline', [
            formWidgets.renderSelect('Min', formName + 'rating_min',
              settings.game.human.availableRatingRanges.min, settingsObj.ratingMin, false)
          ]),
          m('div.select_input.inline', [
            formWidgets.renderSelect('Max', formName + 'rating_max',
              settings.game.human.availableRatingRanges.max, settingsObj.ratingMax, false)
          ])
        ])
      );
    }
  }

  // both human and AI
  var timeFieldset = [
    m('div.select_input', {
      key: formName + 'timeMode'
    }, [
      formWidgets.renderSelect('clock', formName + 'timeMode', timeModes, settingsObj.timeMode)
    ])
  ];

  // both human and AI
  if (hasClock) {
    timeFieldset.push(
      m('div.select_input.inline', {
        key: formName + 'time'
      }, [
        formWidgets.renderSelect('time', formName + 'time',
          settings.game.availableTimes.map(utils.tupleOf), settingsObj.time, false)
      ]),
      m('div.select_input.inline', {
        key: formName + 'increment'
      }, [
        formWidgets.renderSelect('increment', formName + 'increment',
          settings.game.availableIncrements.map(utils.tupleOf), settingsObj.increment, false)
      ])
    );
  }

  // human only
  if (hasDays) {
    timeFieldset.push(
      m('div.select_input.large_label', {
        key: formName + 'days'
      }, [
        formWidgets.renderSelect('daysPerTurn', formName + 'days',
          settings.game.availableDays.map(utils.tupleOf), settingsObj.days, false)
      ]));
  }

  return m('form#new_game_form.game_form', {
    onsubmit: function(e) {
      e.preventDefault();
      if (!settings.game.isTimeValid(settingsObj)) return;
      newGameForm.close();
      action();
    }
  }, [
    m('fieldset', [
      m('div.nice-radio', formWidgets.renderRadio(
        'human',
        'selected',
        'human',
        settings.game.selected() === 'human',
        e => settings.game.selected(e.target.value)
      )),
      m('div.nice-radio', formWidgets.renderRadio(
        'computer',
        'selected',
        'computer',
        settings.game.selected() === 'computer',
        e => settings.game.selected(e.target.value)
      ))
    ]),
    m('fieldset', generalFieldset),
    m('fieldset#clock', timeFieldset),
    m('button[data-icon=E][type=submit]', i18n('createAGame'))
  ]);
}

newGameForm.view = function() {

  function form() {
    return settings.game.selected() === 'human' ? renderForm(
      'human',
      seekHumanGame,
      settings.game.human,
      settings.game.human.availableVariants,
      settings.game.human.availableTimeModes.filter(function(e) {
        // correspondence and unlimited time modes are only available when
        // connected
        return e[1] === '1' || session.isConnected();
      })
    ) : renderForm(
      'ai',
      startAIGame,
      settings.game.ai,
      settings.game.ai.availableVariants,
      settings.game.ai.availableTimeModes
    );
  }

  return popupWidget(
    'new_game_form_popup game_form_popup',
    null,
    form,
    newGameForm.isOpen,
    newGameForm.close
  );
};

module.exports = newGameForm;
