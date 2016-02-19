import { request } from '../../http';
import { noop, serializeQueryParameters } from '../../utils';
import i18n from '../../i18n';

export function reload(ctrl) {
  return request(ctrl.data.url.round, { background: true });
}

export function getPGN(gameId) {
  return request(`/game/export/${gameId}.pgn`, {
    deserialize: text => text
  }, true);
}

export function syncNote(gameId, notes) {

  function xhrConfig(xhr) {
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded; charset=UTF-8');
    xhr.withCredentials = true;
    xhr.timeout = 10000;
  }

  return request(`/${gameId}/note`, {
    method: 'POST',
    serialize: t => t,
    deserialize: t => t,
    data: serializeQueryParameters({ text: notes })
  }, false, xhrConfig)
  .then(noop, err => {
    window.plugins.toast.show(i18n('notesSynchronizationHasFailed'), 'short', 'center');
    throw err;
  });
}
