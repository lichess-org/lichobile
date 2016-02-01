import { request } from '../../http';
import { handleXhrError, serializeQueryParameters } from '../../utils';

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
    xhr.timeout = 8000;
  }

  return request(`/${gameId}/note`, {
    method: 'POST',
    serialize: t => t,
    deserialize: t => t,
    data: serializeQueryParameters({ text: notes })
  }, true, xhrConfig)
  .then(handleXhrError);
}
