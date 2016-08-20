import { fetchJSON, fetchText } from '../../http';
import { noop, serializeQueryParameters } from '../../utils';
import i18n from '../../i18n';

export function reload(ctrl) {
  return fetchJSON(ctrl.data.url.round);
}

export function getPGN(gameId) {
  return fetchText(`/game/export/${gameId}.pgn`, null, true);
}

export function readNote(gameId) {
  return fetchText(`/${gameId}/note`);
}

export function syncNote(gameId, notes) {

  return fetchText(`/${gameId}/note`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Accept': 'application/json, text/*'
    },
    body: serializeQueryParameters({ text: notes })
  }, false)
  .then(noop)
  .catch(err => {
    window.plugins.toast.show(i18n('notesSynchronizationHasFailed'), 'short', 'center');
    throw err;
  });
}
