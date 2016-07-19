import * as utils from '../utils';
import * as xhr from '../xhr';
import settings from '../settings';
import session from '../session';
import formWidgets from './shared/form';
import popupWidget from './shared/popup';
import i18n from '../i18n';
import backbutton from '../backbutton';
import lobby from './lobby';
import m from 'mithril';

let isOpen = false;

export default {
  open,

  close,

  openRealTime() {
    settings.gameSetup.human.timeMode('1');
    open();
  },

  openCorrespondence() {
    settings.gameSetup.human.timeMode('2');
    open();
  },

  view() {

    function form() {
      return renderForm(
        'human',
        settings.gameSetup.human,
        settings.gameSetup.human.availableVariants,
        settings.gameSetup.human.availableTimeModes.filter(function(e) {
          // correspondence and unlimited time modes are only available when
          // connected
          return e[1] === '1' || session.isConnected();
        })
      );
    }

    return popupWidget(
      'new_game_form_popup game_form_popup',
      null,
      form,
      isOpen,
      close
    );
  }
};

function open() {
  backbutton.stack.push(close);
  isOpen = true;
}

function close(fromBB) {
  if (fromBB !== 'backbutton' && isOpen) backbutton.stack.pop();
  isOpen = false;
}

function seekHumanGame() {
  if (settings.gameSetup.human.timeMode() === '1') {
    close();
    lobby.startSeeking();
  }
  else {
    xhr.seekGame().then(utils.noop, utils.handleXhrError);
    m.route('/correspondence');
  }
}

function renderForm(formName, settingsObj, variants, timeModes) {
  const timeMode = settingsObj.timeMode();
  const hasClock = timeMode === '1';
  const hasDays = timeMode === '2' && session.isConnected();

  // be sure to set real time clock if disconnected
  if (!session.isConnected()) {
    settings.gameSetup.human.timeMode('1');
  }
  if (timeMode === '0') {
    settings.gameSetup.human.mode('0');
  }

  // if mode is rated only allow random color
  var colors;
  if (settingsObj.mode() === '1') {
    settingsObj.color('random');
    colors = [
      ['randomColor', 'random']
    ];
  } else {
    colors = [
      ['randomColor', 'random'],
      ['white', 'white'],
      ['black', 'black']
    ];
  }

  const modes = (session.isConnected() && timeMode !== '0') ? [
    ['casual', '0'],
    ['rated', '1']
  ] : [
    ['casual', '0']
  ];

  const generalFieldset = [
    m('div.select_input', {
      key: formName + 'color'
    }, [
      formWidgets.renderSelect('side', formName + 'color', colors, settingsObj.color)
    ]),
    m('div.select_input', {
      key: formName + 'variant'
    }, [
      formWidgets.renderSelect('variant', formName + 'variant', variants, settingsObj.variant)
    ])
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
            settings.gameSetup.human.availableRatingRanges.min, settingsObj.ratingMin, false)
        ]),
        m('div.select_input.inline', [
          formWidgets.renderSelect('Max', formName + 'rating_max',
            settings.gameSetup.human.availableRatingRanges.max, settingsObj.ratingMax, false)
        ])
      ])
    );
  }

  if (session.isConnected() && settingsObj.mode() === '0') {
    generalFieldset.push(
      formWidgets.renderCheckbox(i18n('membersOnly'), 'membersOnly', settingsObj.membersOnly)
    );
  }

  const timeFieldset = [
    m('div.select_input', {
      key: formName + 'timeMode'
    }, [
      formWidgets.renderSelect('clock', formName + 'timeMode', timeModes, settingsObj.timeMode)
    ])
  ];

  if (hasClock) {
    timeFieldset.push(
      m('div.select_input.inline', {
        key: formName + 'time'
      }, [
        formWidgets.renderSelect('time', formName + 'time',
          settings.gameSetup.availableTimes, settingsObj.time, false)
      ]),
      m('div.select_input.inline', {
        key: formName + 'increment'
      }, [
        formWidgets.renderSelect('increment', formName + 'increment',
          settings.gameSetup.availableIncrements.map(utils.tupleOf), settingsObj.increment, false)
      ])
    );
  }

  if (hasDays) {
    timeFieldset.push(
      m('div.select_input.large_label', {
        key: formName + 'days'
      }, [
        formWidgets.renderSelect('daysPerTurn', formName + 'days',
          settings.gameSetup.availableDays.map(utils.tupleOf), settingsObj.days, false)
      ]));
  }

  return m('form.game_form', {
    onsubmit: function(e) {
      e.preventDefault();
      if (!settings.gameSetup.isTimeValid(settingsObj)) return;
      close();
      seekHumanGame();
    }
  }, [
    m('fieldset', generalFieldset),
    m('fieldset', timeFieldset),
    m('button[data-icon=E][type=submit].newGameButton', i18n('createAGame'))
  ]);
}
