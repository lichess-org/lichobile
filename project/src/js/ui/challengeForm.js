import * as utils from '../utils';
import { challenge as challengeXhr } from '../xhr';
import settings from '../settings';
import session from '../session';
import formWidgets from './shared/form';
import popupWidget from './shared/popup';
import i18n from '../i18n';
import storage from '../storage';
import backbutton from '../backbutton';
import ViewOnlyBoard from './shared/ViewOnlyBoard';
import helper from './helper';
import m from 'mithril';

var challengeForm = {
  actionName: '',
  userId: null,
  isOpen: false
};

challengeForm.open = function(userId) {
  if (userId) {
    challengeForm.userId = userId;
    challengeForm.actionName = i18n('challengeToPlay');
  } else {
    challengeForm.userId = null;
    challengeForm.actionName = i18n('playWithAFriend');
  }
  backbutton.stack.push(challengeForm.close);
  challengeForm.isOpen = true;
  challengeForm.fen = null;
};

challengeForm.openFromPosition = function(fen) {
  challengeForm.userId = null;
  settings.gameSetup.challenge.variant('3');
  settings.gameSetup.challenge.mode('0');
  challengeForm.open();
  challengeForm.fen = fen;
};

challengeForm.close = function(fromBB) {
  if (fromBB !== 'backbutton' && challengeForm.isOpen) backbutton.stack.pop();
  challengeForm.isOpen = false;
};

function challenge() {
  const userId = challengeForm.userId;
  return challengeXhr(userId, challengeForm.fen).then(data => {

    helper.analyticsTrackEvent('Challenge', 'Sent');

    if (session.isConnected() && (
      data.challenge.timeControl.type === 'correspondence' ||
      data.challenge.timeControl.type === 'unlimited')) {

      if (!storage.get('donotshowpersistentchallengeexplanation')) {
        window.navigator.notification.alert(i18n('persistentChallengeCreated'), function() {
          storage.set('donotshowpersistentchallengeexplanation', true);
        });
      }
      m.route('/correspondence', { tab: 'challenges' });
    }
    if (!data.challenge.destUser || data.challenge.timeControl.type === 'clock') {
      m.route(`/challenge/${data.challenge.id}`);
    }
  }, error => {
    utils.handleXhrError(error);
    throw error;
  });
}

function renderForm() {
  var formName = 'invite';
  var settingsObj = settings.gameSetup.challenge;
  var variants = settings.gameSetup.challenge.availableVariants;
  var timeModes = settings.gameSetup.challenge.availableTimeModes;
  var timeMode = settingsObj.timeMode();
  var hasClock = timeMode === '1';
  var hasDays = timeMode === '2';

  // if mode is rated only allow random color for three-check, atomic, antichess
  // horde variants
  var colors;
  if (settingsObj.mode() === '1' &&
    ['5', '6', '7', '8', '9'].indexOf(settingsObj.variant()) !== -1) {
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

  var modes = session.isConnected() ? [
    ['casual', '0'],
    ['rated', '1']
  ] : [
    ['casual', '0']
  ];

  var generalFieldset = [
    m('div.select_input', {
      key: formName + 'color'
    }, [
      formWidgets.renderSelect('side', formName + 'color', colors, settingsObj.color)
    ]),
    m('div.select_input', {
      key: formName + 'variant'
    }, [
      formWidgets.renderSelect('variant', formName + 'variant', variants, settingsObj.variant)
    ]),
    settingsObj.variant() === '3' ?
    m('div.setupPosition', {
      key: 'position'
    }, challengeForm.fen ? [
      m('div.setupMiniBoardWrapper', {
        config: helper.ontouch(() => {
          challengeForm.close();
          m.route(`/editor/${encodeURIComponent(challengeForm.fen)}`);
        })
      }, [
        m.component(ViewOnlyBoard, { fen: challengeForm.fen })
      ])
      ] : m('div', m('button.withIcon.fa.fa-pencil', {
        config: helper.ontouch(() => {
          challengeForm.close();
          m.route('/editor');
        })
      }, i18n('boardEditor')))
    ) : null,
    settingsObj.variant() !== '3' ?
    m('div.select_input', {
      key: formName + 'mode'
    }, [
      formWidgets.renderSelect('mode', formName + 'mode', modes, settingsObj.mode)
    ]) : null
  ];

  var timeFieldset = [
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

  return m('form#invite_form.game_form', {
    onsubmit: function(e) {
      e.preventDefault();
      if (!settings.gameSetup.isTimeValid(settingsObj)) return;
      challengeForm.close();
      challenge();
    }
  }, [
    m('fieldset', generalFieldset),
    m('fieldset#clock', timeFieldset),
    m('button[data-icon=E][type=submit].newGameButton', challengeForm.actionName)
  ]);
}

challengeForm.view = function() {
  return popupWidget(
    'invite_form_popup game_form_popup',
    null,
    renderForm,
    challengeForm.isOpen,
    challengeForm.close
  );
};

export default challengeForm;
