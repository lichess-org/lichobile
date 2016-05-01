import * as xhr from '../userXhr';
import { handleXhrError } from '../../../utils';
import helper from '../../helper';
import IScroll from 'iscroll/build/iscroll-probe';
import throttle from 'lodash/throttle';
import socket from '../../../socket';
import challengeForm from '../../challengeForm';
import m from 'mithril';

var scroller;

export default function controller() {

  helper.analyticsTrackView('User following');

  socket.createDefault();

  const userId = m.route.param('id');
  const following = m.prop([]);
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

  function scrollerConfig(el, isUpdate, context) {
    if (!isUpdate) {
      scroller = new IScroll(el, {
        probeType: 2
      });
      scroller.on('scroll', throttle(onScroll, 150));
      context.onunload = () => {
        if (scroller) {
          scroller.destroy();
          scroller = null;
        }
      };
    }
    scroller.refresh();
  }

  function loadNextPage(page) {
    isLoadingNextPage(true);
    xhr.following(userId, page).then(data => {
      isLoadingNextPage(false);
      paginator(data.paginator);
      following(following().concat(data.paginator.currentPageResults));
      m.redraw();
    }, handleXhrError);
    m.redraw();
  }

  xhr.following(userId, 1, true).then(data => {
    paginator(data.paginator);
    following(data.paginator.currentPageResults);
  }, err => {
    handleXhrError(err);
    m.route('/');
  })
  .then(() => setTimeout(() => {
    if (scroller) scroller.scrollTo(0, 0, 0);
  }, 50));

  function setNewUserState(obj, newData) {
    obj.relation = newData.following;
  }

  return {
    following,
    scrollerConfig,
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
