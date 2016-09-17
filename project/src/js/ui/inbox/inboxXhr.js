import { fetchJSON } from '../../http';

export function inbox() {
  return fetchJSON('/inbox', {}, true);
}

export function message(id) {
  return fetchJSON('/inbox/' + id, {}, true);
}

export function newThread() {
  return fetchJSON('/inbox/new', {}, true);
}

export function deleteThread(id) {
  return fetchJSON('/inbox/' + id + '/delete', {}, true);
}
