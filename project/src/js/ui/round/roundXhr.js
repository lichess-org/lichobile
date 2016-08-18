import { fetchJSON, fetchText } from '../../http';
import { noop } from '../../utils';
import i18n from '../../i18n';

export function reload(ctrl) {
  return fetchJSON(ctrl.data.url.round);
}

export function getPGN(gameId) {
  return fetchText(`/game/export/${gameId}.pgn`, null, true);
}

export function syncNote(gameId, notes) {

  function xhrConfig(xhr) {
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded; charset=UTF-8');
    xhr.withCredentials = true;
    xhr.timeout = 10000;
  }

  return fetchText(`/${gameId}/note`, {
    method: 'POST',
    body: JSON.stringify({ text: notes })
  }, false, xhrConfig)
  .then(noop)
  .catch(err => {
    window.plugins.toast.show(i18n('notesSynchronizationHasFailed'), 'short', 'center');
    throw err;
  });
}
