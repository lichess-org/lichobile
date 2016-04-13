import * as utils from '../utils';
import helper from './helper';
import iScroll from 'iscroll';
import session from '../session';
import i18n from '../i18n';
import backbutton from '../backbutton';
import * as xhr from '../xhr';
import newGameForm from './newGameForm';
import gameApi from '../lichess/game';
import challengesApi from '../lichess/challenges';
import m from 'mithril';
import ViewOnlyBoard from './shared/ViewOnlyBoard';

var scroller = null;

const gamesMenu = {};

gamesMenu.isOpen = false;

gamesMenu.open = function() {
  backbutton.stack.push(gamesMenu.close);
  gamesMenu.isOpen = true;
  setTimeout(function() {
    if (utils.hasNetwork() && scroller) scroller.goToPage(1, 0);
  }, 400);
  session.refresh();
};

gamesMenu.close = function(fromBB) {
  if (fromBB !== 'backbutton' && gamesMenu.isOpen) backbutton.stack.pop();
  gamesMenu.isOpen = false;
};

gamesMenu.lastJoined = null;

function joinGame(g) {
  gamesMenu.lastJoined = g;
  gamesMenu.close();
  m.route('/game/' + g.fullId);
}

function acceptChallenge(id) {
  return xhr.acceptChallenge(id)
  .then(data => {
    helper.analyticsTrackEvent('Challenge', 'Accepted');
    m.route('/game' + data.url.round);
  })
  .then(() => challengesApi.remove(id))
  .then(gamesMenu.close);
}

function declineChallenge(id) {
  return xhr.declineChallenge(id).then(() => {
    helper.analyticsTrackEvent('Challenge', 'Declined');
    challengesApi.remove(id);
  });
}

function cardDims() {
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

function renderViewOnlyBoard(cDim, fen, lastMove, orientation, variant) {
  const style = cDim ? { height: cDim.innerW + 'px' } : {};
  const bounds = { width: cDim.innerW, height: cDim.innerW };
  return (
    <div className="boardWrapper" style={style}>
      {m.component(ViewOnlyBoard, { bounds, fen, lastMove, orientation, variant })}
    </div>
  );
}

function timeLeft(g) {
  if (!g.isMyTurn) return i18n('waitingForOpponent');
  if (!g.secondsLeft) return i18n('yourTurn');
  var time = window.moment().add(g.secondsLeft, 'seconds');
  return m('time', {
    datetime: time.format()
  }, time.fromNow());
}

function savedGameDataToCardData(data) {
  const obj = {
    color: data.player.color,
    fen: data.game.fen,
    fullId: data.url.round.substr(1),
    gameId: data.game.id,
    isMyTurn: gameApi.isPlayerTurn(data),
    lastMove: data.game.lastMove,
    perf: data.game.perf,
    opponent: {},
    rated: data.game.rated,
    secondsLeft: data.correspondence && data.correspondence[data.player.color],
    speed: data.game.speed,
    variant: data.game.variant
  };

  if (data.opponent.user) {
    obj.opponent = {
      id: data.opponent.user.id,
      username: data.opponent.user.username,
      rating: data.opponent.rating
    };
  }

  return obj;
}

function renderGame(g, cDim, cardStyle) {
  const icon = g.opponent.ai ? ':' : utils.gameIcon(g.perf);
  const cardClass = [
    'card',
    'standard',
    g.color
  ].join(' ');
  const timeClass = [
    'timeIndication',
    g.isMyTurn ? 'myTurn' : 'opponentTurn'
  ].join(' ');
  const config = helper.isWideScreen() ?
    helper.ontouchY(() => joinGame(g)) :
    helper.ontouchX(() => joinGame(g));

  return (
    <div className={cardClass} key={'game.' + g.gameId} style={cardStyle}
      config={config}
    >
      {renderViewOnlyBoard(cDim, g.fen, g.lastMove, g.color, g.variant)}
      <div className="infos">
        <div className="icon-game" data-icon={icon ? icon : ''} />
        <div className="description">
          <h2 className="title">{utils.playerName(g.opponent, false)}</h2>
          <p>
            <span className="variant">{g.variant.name}</span>
            <span className={timeClass}>{timeLeft(g)}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function renderIncomingChallenge(c, cDim, cardStyle) {
  if (!c.challenger) {
    return null;
  }

  const mode = c.rated ? i18n('rated') : i18n('casual');
  const timeAndMode = utils.challengeTime(c) + ', ' + mode;
  const mark = c.challenger.provisional ? '?' : '';
  const playerName = `${c.challenger.id} (${c.challenger.rating}${mark})`;

  return (
    <div className="card standard challenge" style={cardStyle}>
      {renderViewOnlyBoard(cDim, c.initialFen, null, null, c.variant)}
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
          <button config={helper.ontouchX(utils.f(acceptChallenge, c.id))}>
            {i18n('accept')}
          </button>
          <button config={helper.ontouchX(
            helper.fadesOut(declineChallenge.bind(undefined, c.id), '.card', 250)
          )}>
            {i18n('decline')}
          </button>
        </div>
      </div>
    </div>
  );
}

function renderAllGames(cDim) {
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
    utils.getOfflineGames().length;

  let wrapperStyle, wrapperWidth;
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

  var allCards = challengesDom.concat(nowPlaying.map(g => renderGame(g, cDim, cardStyle)));

  if (!utils.hasNetwork()) {
    allCards = utils.getOfflineGames().map(d => {
      const g = savedGameDataToCardData(d);
      return renderGame(g, cDim, cardStyle);
    });
  }

  if (!helper.isWideScreen()) {
    const newGameCard = (
      <div className="card standard" key="game.new-game" style={cardStyle}
        config={helper.ontouchX(() => { gamesMenu.close(); newGameForm.open(); })}
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

  return m('div#all_games', { style: wrapperStyle }, allCards);
}

gamesMenu.view = function() {
  if (!gamesMenu.isOpen) return null;

  const vh = helper.viewportDim().vh;
  const cDim = cardDims();
  const wrapperStyle = helper.isWideScreen() ? {} : { top: ((vh - cDim.h) / 2) + 'px' };
  const wrapperConfig =
  helper.isWideScreen() ? utils.noop : function(el, isUpdate, context) {
    if (!isUpdate) {
      scroller = new iScroll(el, {
        scrollX: true,
        scrollY: false,
        momentum: false,
        snap: '.card',
        snapSpeed: 400,
        preventDefaultException: {
          tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT|LABEL)$/
        }
      });

      context.onunload = function() {
        if (scroller) {
          scroller.destroy();
          scroller = null;
        }
      };
    }
    // see https://github.com/cubiq/iscroll/issues/412
    scroller.options.snap = el.querySelectorAll('.card');
    scroller.refresh();
  };
  const wrapperClass = helper.isWideScreen() ? 'overlay_popup' : '';

  return (
    <div id="games_menu" className="overlay_popup_wrapper">
      <div className="wrapper_overlay_close"
        config={helper.ontouch(helper.fadesOut(gamesMenu.close, '.overlay_popup_wrapper'))} />
      <div id="wrapper_games" className={wrapperClass} style={wrapperStyle} config={wrapperConfig}>
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
};

export default gamesMenu;
