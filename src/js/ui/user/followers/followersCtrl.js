import * as xhr from '../userXhr';
import { handleXhrError } from '../../../utils';
import redraw from '../../../utils/redraw';
import * as helper from '../../helper';
import IScroll from 'iscroll/build/iscroll-probe';
import { throttle } from 'lodash/function';
import socket from '../../../socket';
import challengeForm from '../../challengeForm';
import * as m from 'mithril';
import * as stream from 'mithril/stream';

var scroller;

export default function oninit(vnode) {

  helper.analyticsTrackView('User followers');

  socket.createDefault();

  const userId = vnode.attrs.id;
  const followers = stream([]);
  const paginator = stream(null);
  const isLoadingNextPage = stream(false);

  function onScroll() {
    if (this.y + this.distY <= this.maxScrollY) {
      // lichess doesn't allow for more than 39 pages
      if (!isLoadingNextPage() && paginator().nextPage && paginator().nextPage < 40) {
        loadNextPage(paginator().nextPage);
      }
    }
  }

  function scrollerConfig(vn) {
    const el = vn.dom;
    scroller = new IScroll(el, {
      probeType: 2
    });
    scroller.on('scroll', throttle(onScroll, 150));
  }

  function scrollerOnUpdate() {
    scroller.refresh();
  }

  function loadNextPage(page) {
    isLoadingNextPage(true);
    xhr.followers(userId, page)
    .then(data => {
      isLoadingNextPage(false);
      paginator(data.paginator);
      followers(followers().concat(data.paginator.currentPageResults));
      redraw();
    })
    .catch(handleXhrError);
    redraw();
  }

  xhr.followers(userId, 1, true)
  .then(data => {
    paginator(data.paginator);
    followers(data.paginator.currentPageResults);
    redraw();
  })
  .then(() => setTimeout(() => {
    if (scroller) scroller.scrollTo(0, 0, 0);
  }, 50))
  .catch(handleXhrError);

  function setNewUserState(obj, newData) {
    obj.relation = newData.followers;
  }

  vnode.state = {
    followers,
    scrollerConfig,
    scrollerOnUpdate,
    isLoadingNextPage,
    toggleFollowing: obj => {
      if (obj.relation) xhr.unfollow(obj.user).then(setNewUserState.bind(undefined, obj));
      else xhr.follow(obj.user).then(setNewUserState.bind(undefined, obj));
    },
    challenge(id) {
      challengeForm.open(id);
    }
  };
}
