import { fetchJSON } from '../../http';
import { PagedThreads, ThreadData, ComposeResponse } from './interfaces'

export function inbox(feedback = true): Promise<PagedThreads> {
  return fetchJSON('/inbox', {}, feedback);
}

export function reload(page: number): Promise<PagedThreads> {
  return fetchJSON('/inbox/',
  {
    method: 'GET',
    query: page ? { page } : {}
  });
}

export function thread(id: string): Promise<ThreadData> {
  return fetchJSON('/inbox/' + id, {}, true);
}

export function respond(id: string, response: string): Promise<ComposeResponse> {
  return fetchJSON('/inbox/' + id, {
    method: 'POST',
    body: JSON.stringify({
      text: response
    })
  }, true);
}

export function newThread(username: string, subject: string, text: string) {
  return fetchJSON('/inbox/new', {
    method: 'POST',
    body: JSON.stringify({
      username,
      subject,
      text
    })
  }, true);
}

export function deleteThread(id: string) {
  return fetchJSON('/inbox/' + id + '/delete', {method: 'POST'}, true);
}
