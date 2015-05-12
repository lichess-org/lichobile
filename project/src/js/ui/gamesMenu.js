/** @jsx m */
var utils = require('../utils');
var helper = require('./helper');
var settings = require('../settings');
var iScroll = require('iscroll');
var session = require('../session');
var i18n = require('../i18n');
var moment = window.moment;
var backbutton = require('../backbutton');
var newGameForm = require('./newGameForm');
var gameData = require('../lichess/game');
var challengesData = require('../lichess/challenges');

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

function cardDims() {
  var vp = helper.viewportDim();
  var width = vp.vw * 85 / 100;
  var margin = vp.vw * 2.5 / 100;
  return {
    w: width + margin * 2,
    h: width + 100,
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
    config: helper.ontouchendScrollX(() => joinGame(g))
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
  return (
    <div className="card standard challenge" style={cardStyle}>
      {renderViewOnlyBoard(cDim, c.game.fen, c.game.lastMove, null, c.game.variant)}
      <div className="infos">
        <div className="icon-game" data-icon={icon}></div>
        <div className="description">
          <h2 className="title">{i18n('playerisInvitingYou', utils.playerName(c.opponent, false))}</h2>
          <p className="variant">
            {i18n('toAGame', c.game.variant.name)}
            <span className="time-indication">{gameData.time(c)}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function renderAllGames(cDim) {
  const nowPlaying = session.nowPlaying();
  const challenges = challengesData.list();
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

  const allGames = challengesDom.concat(nowPlaying.map(g => renderGame(g, cDim, cardStyle)));

  allGames.unshift(
    m('div.card.standard', {
      key: 'game.new-game',
      style: cardStyle,
      config: helper.ontouchendScrollX(function() {
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
  }, allGames);
}

gamesMenu.view = function() {
  if (!gamesMenu.isOpen) return m('div#games_menu.overlay.overlay_fade');
  var vh = helper.viewportDim().vh;
  var cDim = cardDims();
  var children = [
    m('button.overlay_close.fa.fa-close', {
      config: helper.ontouchend(gamesMenu.close)
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
