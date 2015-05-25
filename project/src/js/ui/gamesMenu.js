/** @jsx m */
var utils = require('../utils');
var helper = require('./helper');
var settings = require('../settings');
var iScroll = require('iscroll');
var session = require('../session');
var i18n = require('../i18n');
var moment = window.moment;
var backbutton = require('../backbutton');
var xhr = require('../xhr');
var newGameForm = require('./newGameForm');
var gameApi = require('../lichess/game');
var challengesApi = require('../lichess/challenges');

var scroller = null;

const gamesMenu = {};

gamesMenu.isOpen = false;

gamesMenu.open = function() {
  helper.analyticsTrackView('Games Menu');
  backbutton.stack.push(gamesMenu.close);
  gamesMenu.isOpen = true;
  setTimeout(function() {
    if (scroller) scroller.goToPage(1, 0);
  }, 400);
  if (utils.hasNetwork() && session.isConnected()) session.refresh();
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
  return xhr.joinChallenge(id)
  .then(data =>
    m.route('/game' + data.url.round)
  )
  .then(() => challengesApi.remove(id))
  .then(gamesMenu.close);
}

function declineChallenge(id) {
  return xhr.declineChallenge(id).then(() =>
    challengesApi.remove(id)
  );
}

function cardDims() {
  var vp = helper.viewportDim();
  var width = vp.vw * 85 / 100;
  var margin = vp.vw * 2.5 / 100;
  return {
    w: width + margin * 2,
    h: width + 145,
    innerW: width,
    margin: margin
  };
}

function renderViewOnlyBoard(cDim, fen, lastMove, color, variant) {
  return m('div', {
    style: {
      height: cDim.innerW + 'px'
    }
  }, [
    helper.viewOnlyBoard(fen, lastMove, color, variant,
      settings.general.theme.board(), settings.general.theme.piece()
    )
  ]);
}

function timeLeft(g) {
  if (!g.isMyTurn) return i18n('waitingForOpponent');
  if (!g.secondsLeft) return i18n('yourTurn');
  var time = moment().add(g.secondsLeft, 'seconds');
  return m('time', {
    datetime: time.format()
  }, time.fromNow());
}

function renderGame(g, cDim, cardStyle) {
  const icon = g.opponent.ai ? ':' : utils.gameIcon(g.perf);
  return m('div.card.standard.' + g.color, {
    key: 'game.' + g.gameId,
    style: cardStyle,
    config: helper.ontouchX(() => joinGame(g))
  }, [
    renderViewOnlyBoard(cDim, g.fen, g.lastMove, g.color, g.variant),
    m('div.infos', [
      m('div.icon-game', {
        'data-icon': icon ? icon : ''
      }),
      m('div.description', [
        m('h2.title', utils.playerName(g.opponent, false)),
        m('p', [
          g.variant.name,
          m('span.time-indication', timeLeft(g))
        ])
      ])
    ])
  ]);
}

function renderChallenge(c, cDim, cardStyle) {
  const icon = utils.gameIcon(c.game.perf);
  const mode = c.game.rated ? i18n('rated') : i18n('casual');
  const timeAndMode = gameApi.time(c) + ', ' + mode;
  return (
    <div className="card standard challenge" style={cardStyle}>
      {renderViewOnlyBoard(cDim, c.game.fen, c.game.lastMove, null, c.game.variant)}
      <div className="infos">
        <div className="icon-game" data-icon={icon}></div>
        <div className="description">
          <h2 className="title">{i18n('playerisInvitingYou', utils.playerName(c.opponent, false))}</h2>
          <p className="variant">
            {i18n('toATypeGame', c.game.variant.name)}
            <span className="time-indication" data-icon="p">{timeAndMode}</span>
          </p>
        </div>
        <div className="actions">
          <button config={helper.ontouchX(utils.f(acceptChallenge, c.game.id))}>
            {i18n('accept')}
          </button>
          <button config={helper.ontouchX(
            helper.fadesOut(declineChallenge.bind(undefined, c.game.id), '.card')
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
  const challenges = challengesApi.list();
  const cardStyle = {
    width: (cDim.w - cDim.margin * 2) + 'px',
    height: cDim.h + 'px',
    marginLeft: cDim.margin + 'px',
    marginRight: cDim.margin + 'px'
  };
  const nbCards = challenges.length + nowPlaying.length + 1;
  // scroller wrapper width
  // calcul is:
  // ((cardWidth + visible part of adjacent card) * nb of cards) +
  //   wrapper's marginLeft
  const wrapperWidth = ((cDim.w + cDim.margin * 2) * nbCards) +
    (cDim.margin * 2);

  const challengesDom = challenges.map(c => renderChallenge(c, cDim, cardStyle));

  const allCards = challengesDom.concat(nowPlaying.map(g => renderGame(g, cDim, cardStyle)));

  allCards.unshift(
    m('div.card.standard', {
      key: 'game.new-game',
      style: cardStyle,
      config: helper.ontouchX(function() {
        gamesMenu.close();
        newGameForm.open();
      })
    }, [
      renderViewOnlyBoard(cDim),
      m('div.infos', [
        m('div.description', [
          m('h2.title', i18n('createAGame')),
          m('p', i18n('newOpponent'))
        ])
      ])
    ])
  );

  return m('div#all_games', {
    style: {
      width: wrapperWidth + 'px',
      marginLeft: (cDim.margin * 3) + 'px'
    }
  }, allCards);
}

gamesMenu.view = function() {
  if (!gamesMenu.isOpen) return m('div#games_menu.overlay.overlay_fade');
  var vh = helper.viewportDim().vh;
  var cDim = cardDims();
  var children = [
    m('div.wrapper_overlay_close', {
      config: helper.ontouch(gamesMenu.close)
    }),
    m('div#wrapper_games', {
      style: {
        top: ((vh - cDim.h) / 2) + 'px'
      },
      config: function(el, isUpdate, context) {
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
      }
    }, renderAllGames(cDim))
  ];

  return m('div#games_menu.overlay.overlay_fade.open', children);
};

module.exports = gamesMenu;
