import settings from '../settings';
import i18n from '../i18n';

var receiving = [];
var sending = [];

function isSupported(c) {
  return settings.game.supportedVariants.indexOf(c.variant.key) !== -1;
}

export default {
  receiving() {
    return receiving.filter(isSupported);
  },

  receivingCount() {
    return receiving.filter(isSupported).length;
  },

  sending() {
    return sending;
  },

  set(data) {
    receiving = data.in;
    sending = data.out;
  },

  remove(key) {
    delete challenges[key];
  },

  time(challenge) {
    if (challenge.timeControl.type === 'clock') {
      return challenge.timeControl.limit + '+' + challenge.timeControl.increment;
    }
    else if (challenge.timeControl.type === 'correspondence') {
      return i18n('nbDays', challenge.timeControl.daysPerTurn);
    }
    else {
      return '∞';
    }
  }

};
