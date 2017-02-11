import * as utils from '../utils';
import { syncWithNowPlayingGames, getOfflineGames } from '../utils/offlineGames';
import router from '../router';
import * as helper from './helper';
import * as IScroll from 'iscroll';
import session from '../session';
import i18n from '../i18n';
import * as xhr from '../xhr';
import newGameForm from './newGameForm';
import * as gameApi from '../lichess/game';
import challengesApi from '../lichess/challenges';
import { NowPlayingGame } from '../lichess/interfaces';
import { Challenge } from '../lichess/interfaces/challenge';
import * as h from 'mithril/hyperscript';
import ViewOnlyBoard from './shared/ViewOnlyBoard';

interface CardDim {
  w: number
  h: number
  innerW: number
  margin: number
}

let scroller: IScroll = null;

let isOpen = false;
let lastJoined: NowPlayingGame | undefined;

export interface GamesMenu {
  lastJoined(): NowPlayingGame | undefined
  resetLastJoined(): void
  open(): void
  close(fromBB?: string): void
  view(): Mithril.Child
}

export default {
  lastJoined() {
    return lastJoined;
  },
  resetLastJoined() {
    lastJoined = undefined
  },
  open,
  close,
  view() {
    if (!isOpen) return null;

    const vh = helper.viewportDim().vh;
    const cDim = cardDims();
    const wrapperStyle = helper.isWideScreen() ? {} : { top: ((vh - cDim.h) / 2) + 'px' };
    function wrapperOnCreate(vnode: Mithril.DOMNode) {
      const el = vnode.dom as HTMLElement;
      if (!helper.isWideScreen()) {
        scroller = new IScroll(el, {
          scrollX: true,
          scrollY: false,
          momentum: false,
          snap: '.card',
          preventDefaultException: {
            tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT|LABEL)$/
          }
        });
      }
    }

    function wrapperOnRemove() {
      if (scroller) {
        scroller.destroy();
        scroller = null;
      }
    }

    function wrapperOnUpdate(vnode: Mithril.DOMNode) {
      // see https://github.com/cubiq/iscroll/issues/412
      const el = vnode.dom;
      if (scroller) {
        scroller.options.snap = el.querySelectorAll('.card');
        scroller.refresh();
      }
    }

    const wrapperClass = helper.isWideScreen() ? 'overlay_popup' : '';

    return (
      <div id="games_menu" className="overlay_popup_wrapper"
      onbeforeremove={(vnode: Mithril.DOMNode) => {
        vnode.dom.classList.add('fading_out');
        return new Promise((resolve) => {
          setTimeout(resolve, 500);
        })
      }}
      >
      <div className="wrapper_overlay_close"
      oncreate={helper.ontap(() => close())} />
      <div id="wrapper_games" className={wrapperClass} style={wrapperStyle}
      oncreate={wrapperOnCreate} onupdate={wrapperOnUpdate} onremove={wrapperOnRemove}>
      {helper.isWideScreen() ? (
        <header>
        {i18n('nbGamesInPlay', session.nowPlaying().length)}
        </header>
      ) : null
      }
      {helper.isWideScreen() ? (
        <div className="popup_content">
        {renderAllGames(null)}
        </div>
      ) : renderAllGames(cDim)
      }
      </div>
      </div>
    );
  }
}

function open() {
  router.backbutton.stack.push(close);
  isOpen = true;
  setTimeout(function() {
    if (utils.hasNetwork() && scroller) scroller.goToPage(1, 0);
  }, 400);
  session.refresh()
  .then(v => {
    if (v) return session.nowPlaying();
    else return undefined;
  })
  .then(syncWithNowPlayingGames);
};

function close(fromBB?: string) {
  if (fromBB !== 'backbutton' && isOpen) router.backbutton.stack.pop();
  isOpen = false;
};


function joinGame(g: NowPlayingGame) {
  lastJoined = g;
  utils.gamePosCache.set(g.fullId, { fen: g.fen, orientation: g.color })
  close();
  router.set('/game/' + g.fullId);
}

function acceptChallenge(id: string) {
  return xhr.acceptChallenge(id)
  .then(data => {
    helper.analyticsTrackEvent('Challenge', 'Accepted');
    router.set('/game' + data.url.round);
  })
  .then(() => challengesApi.remove(id))
  .then(() => close());
}

function declineChallenge(id: string) {
  return xhr.declineChallenge(id)
  .then(() => {
    helper.analyticsTrackEvent('Challenge', 'Declined');
    challengesApi.remove(id);
  });
}

function cardDims(): CardDim {
  const vp = helper.viewportDim();

  // if we're here it's a phone
  if (helper.isPortrait()) {
    let width = vp.vw * 85 / 100;
    let margin = vp.vw * 2.5 / 100;
    return {
      w: width + margin * 2,
      h: width + 145,
      innerW: width,
      margin: margin
    };
  } else {
    let width = 150;
    let margin = 10;
    return {
      w: width + margin * 2,
      h: width + 70,
      innerW: width,
      margin: margin
    };
  }
}

function renderViewOnlyBoard(cDim: CardDim, fen?: string, lastMove?: string, orientation?: Color, variant?: VariantKey) {
  const style = cDim ? { height: cDim.innerW + 'px' } : {};
  const bounds = cDim ? { width: cDim.innerW, height: cDim.innerW } : null;
  return (
    <div className="boardWrapper" style={style}>
      {h(ViewOnlyBoard, { bounds, fen, lastMove, orientation, variant })}
    </div>
  );
}

function timeLeft(g: NowPlayingGame): Mithril.Child {
  if (!g.isMyTurn) return i18n('waitingForOpponent');
  if (!g.secondsLeft) return i18n('yourTurn');
  const time = window.moment().add(g.secondsLeft, 'seconds');
  return h('time', {
    datetime: time.format()
  }, time.fromNow());
}

function savedGameDataToCardData(data: OnlineGameData): NowPlayingGame {
  return {
    color: data.player.color,
    fen: data.game.fen,
    fullId: data.url.round.substr(1),
    gameId: data.game.id,
    isMyTurn: gameApi.isPlayerTurn(data),
    lastMove: data.game.lastMove,
    perf: data.game.perf,
    opponent: data.opponent.user ? {
      id: data.opponent.user.id,
      username: data.opponent.user.username,
      rating: data.opponent.rating
    } : {
      username: 'Anonymous'
    },
    rated: data.game.rated,
    secondsLeft: data.correspondence && data.correspondence[data.player.color],
    speed: data.game.speed,
    variant: data.game.variant
  };
}

function renderGame(g: NowPlayingGame, cDim: CardDim, cardStyle: Object) {
  const icon = g.opponent.ai ? 'n' : utils.gameIcon(g.perf);
  const playerName = utils.playerName(g.opponent, false);
  const cardClass = [
    'card',
    'standard',
    g.color
  ].join(' ');
  const timeClass = [
    'timeIndication',
    g.isMyTurn ? 'myTurn' : 'opponentTurn'
  ].join(' ');
  const oncreate = helper.isWideScreen() ?
    helper.ontapY(() => joinGame(g)) :
    helper.ontapX(() => joinGame(g));

  return (
    <div className={cardClass} key={'game.' + g.gameId} style={cardStyle}
      oncreate={oncreate}
    >
      {renderViewOnlyBoard(cDim, g.fen, g.lastMove, g.color, g.variant.key)}
      <div className="infos">
        <div className="icon-game" data-icon={icon ? icon : ''} />
        <div className="description">
          <h2 className="title">{playerName}</h2>
          <p>
            <span className="variant">{g.variant.name}</span>
            <span className={timeClass}>{timeLeft(g)}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function renderIncomingChallenge(c: Challenge, cDim: CardDim, cardStyle: Object) {
  if (!c.challenger) {
    return null;
  }

  const mode = c.rated ? i18n('rated') : i18n('casual');
  const timeAndMode = challengesApi.challengeTime(c) + ', ' + mode;
  const mark = c.challenger.provisional ? '?' : '';
  const playerName = `${c.challenger.id} (${c.challenger.rating}${mark})`;

  return (
    <div className="card standard challenge" style={cardStyle}>
      {renderViewOnlyBoard(cDim, c.initialFen, null, null, c.variant.key)}
      <div className="infos">
        <div className="icon-game" data-icon={c.perf.icon}></div>
        <div className="description">
          <h2 className="title">{i18n('playerisInvitingYou', playerName)}</h2>
          <p className="variant">
            <span className="variantName">{i18n('toATypeGame', c.variant.name)}</span>
            <span className="time-indication" data-icon="p">{timeAndMode}</span>
          </p>
        </div>
        <div className="actions">
          <button oncreate={helper.ontapX(utils.f(acceptChallenge, c.id))}>
            {i18n('accept')}
          </button>
          <button oncreate={helper.ontapX(
            helper.fadesOut(declineChallenge.bind(undefined, c.id), '.card', 250)
          )}>
            {i18n('decline')}
          </button>
        </div>
      </div>
    </div>
  );
}

function renderAllGames(cDim: CardDim) {
  const nowPlaying = session.nowPlaying();
  const challenges = challengesApi.incoming();
  const cardStyle = cDim ? {
    width: (cDim.w - cDim.margin * 2) + 'px',
    height: cDim.h + 'px',
    marginLeft: cDim.margin + 'px',
    marginRight: cDim.margin + 'px'
  } : {};
  const nbCards = utils.hasNetwork() ?
    challenges.length + nowPlaying.length + 1 :
    getOfflineGames().length;

  let wrapperStyle: Object, wrapperWidth: number;
  if (cDim) {
    // scroller wrapper width
    // calcul is:
    // ((cardWidth + visible part of adjacent card) * nb of cards) +
    //   wrapper's marginLeft
    wrapperWidth = ((cDim.w + cDim.margin * 2) * nbCards) +
      (cDim.margin * 2);
    wrapperStyle = helper.isWideScreen() ? {} : {
      width: wrapperWidth + 'px',
      marginLeft: (cDim.margin * 3) + 'px'
    };
  } else {
    wrapperStyle = {};
  }

  const challengesDom = challenges.map(c => {
    return renderIncomingChallenge(c, cDim, cardStyle);
  });

  let allCards = challengesDom.concat(nowPlaying.map(g => renderGame(g, cDim, cardStyle)));

  if (!utils.hasNetwork()) {
    allCards = getOfflineGames().map(d => {
      const g = savedGameDataToCardData(d);
      return renderGame(g, cDim, cardStyle);
    });
  }

  if (!helper.isWideScreen()) {
    const newGameCard = (
      <div className="card standard" key="game.new-game" style={cardStyle}
        oncreate={helper.ontapX(() => { close(); newGameForm.open(); })}
      >
        {renderViewOnlyBoard(cDim)}
        <div className="infos">
          <div className="description">
            <h2 className="title">{i18n('createAGame')}</h2>
            <p>{i18n('newOpponent')}</p>
          </div>
        </div>
      </div>
    );

    if (utils.hasNetwork()) allCards.unshift(newGameCard);
  }

  return h('div#all_games', { style: wrapperStyle }, allCards);
}

