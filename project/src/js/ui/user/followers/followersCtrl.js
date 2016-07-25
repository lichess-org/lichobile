import * as xhr from '../userXhr';
import { handleXhrError } from '../../../utils';
import helper from '../../helper';
import IScroll from 'iscroll/build/iscroll-probe';
import throttle from 'lodash/throttle';
import socket from '../../../socket';
import challengeForm from '../../challengeForm';
import m from 'mithril';

var scroller;

export default function oninit(vnode) {

  helper.analyticsTrackView('User followers');

  socket.createDefault();

  const userId = vnode.attrs.id;
  const followers = m.prop([]);
  const paginator = m.prop(null);
  const isLoadingNextPage = m.prop(false);

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
    .run(data => {
      isLoadingNextPage(false);
      paginator(data.paginator);
      followers(followers().concat(data.paginator.currentPageResults));
      m.redraw();
    })
    .catch(handleXhrError);
    m.redraw();
  }

  xhr.followers(userId, 1, true)
  .run(data => {
    paginator(data.paginator);
    followers(data.paginator.currentPageResults);
  })
  .run(() => setTimeout(() => {
    if (scroller) scroller.scrollTo(0, 0, 0);
  }, 50))
  .catch(err => {
    handleXhrError(err);
    m.route.set('/');
  });

  function setNewUserState(obj, newData) {
    obj.relation = newData.followers;
  }

  vnode.state = {
    followers,
    scrollerConfig,
    scrollerOnUpdate,
    isLoadingNextPage,
    toggleFollowing: obj => {
      if (obj.relation) xhr.unfollow(obj.user).run(setNewUserState.bind(undefined, obj));
      else xhr.follow(obj.user).run(setNewUserState.bind(undefined, obj));
    },
    challenge(id) {
      challengeForm.open(id);
    }
  };
}
