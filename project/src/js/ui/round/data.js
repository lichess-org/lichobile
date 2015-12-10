import settings from '../../settings';

export default function(data) {
  switch (settings.game.moveConfirmation()) {
    case 'never':
      data.pref.submitMove = false;
      break;
    case 'correspondence':
      data.pref.submitMove = data.game.speed === 'correspondence';
      break;
    case 'always':
      data.pref.submitMove = true;
      break;
    default:
      data.pref.submitMove = false;
  }

  if (data.clock) {
    data.clock.showTenths = data.pref.clockTenths;
    data.clock.showBar = data.pref.clockBar;
  }

  return data;
}
