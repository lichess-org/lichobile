import socket from '../../socket';
import redraw from '../../utils/redraw';
import { handleXhrError } from '../../utils';
import * as xhr from './inboxXhr';
import * as helper from '../helper';
import * as m from 'mithril';
import { PagedThreads } from './interfaces';
import { throttle } from 'lodash';

export default function oninit(vnode: Mithril.Vnode<{}>): void {
  helper.analyticsTrackView('Inbox');

  socket.createDefault();

  const threads = m.prop<PagedThreads>();
  const isLoading = m.prop<boolean>(false);

  const throttledReload = throttle((p: number) => {
    isLoading(true);
    xhr.reload(p)
    .then(data => {
      threads(data);
      isLoading(false);
      redraw();
    })
    .catch(() => isLoading(false));
  }, 1000);

  xhr.inbox()
  .then(data => {
    threads(data);
    redraw();
  })
  .catch(handleXhrError);

  vnode.state = {
    threads,
    isLoading,
    first() {
      if (!isLoading()) throttledReload(1);
    },
    prev() {
      const prevPage = threads().previousPage;
      if (!isLoading() && prevPage) throttledReload(prevPage);
    },
    next() {
      const nextPage = threads().nextPage;
      if (!isLoading() && nextPage) throttledReload(nextPage);
    },
    last() {
      const lastPage = threads().nbPages;
      if (!isLoading() && lastPage) throttledReload(lastPage);
    }
  };
}
