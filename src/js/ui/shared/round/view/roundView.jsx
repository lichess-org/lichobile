"use strict";
var m = require("mithril");
var chessground = require("chessground-mobile");
var socket_1 = require("../../../../socket");
var session_1 = require("../../../../session");
var variant_1 = require("../../../../lichess/variant");
var gameApi = require("../../../../lichess/game");
var perfs_1 = require("../../../../lichess/perfs");
var status_1 = require("../../../../lichess/status");
var settings_1 = require("../../../../settings");
var utils = require("../../../../utils");
var i18n_1 = require("../../../../i18n");
var layout_1 = require("../../../layout");
var helper = require("../../../helper");
var common_1 = require("../../../shared/common");
var Board_1 = require("../../../shared/Board");
var popup_1 = require("../../../shared/popup");
var form_1 = require("../../../shared/form");
var clockView_1 = require("../clock/clockView");
var promotion_1 = require("../promotion");
var button_1 = require("./button");
var chat_1 = require("../chat");
var notes_1 = require("../notes");
var CrazyPocket_1 = require("../crazy/CrazyPocket");
var corresClockView_1 = require("../correspondenceClock/corresClockView");
var replay_1 = require("./replay");
function view(ctrl) {
    var isPortrait = helper.isPortrait();
    return layout_1["default"].board(function () { return renderHeader(ctrl); }, function () { return renderContent(ctrl, isPortrait); }, function () { return overlay(ctrl, isPortrait); });
}
exports.__esModule = true;
exports["default"] = view;
function overlay(ctrl, isPortrait) {
    return [
        ctrl.chat ? chat_1.chatView(ctrl.chat) : null,
        ctrl.notes ? notes_1.notesView(ctrl.notes) : null,
        promotion_1["default"].view(ctrl),
        renderGamePopup(ctrl, isPortrait),
        renderSubmitMovePopup(ctrl),
        common_1.miniUser(ctrl.data.player.user, ctrl.vm.miniUser.player.data, ctrl.vm.miniUser.player.showing, function () { return ctrl.closeUserPopup('player'); }),
        common_1.miniUser(ctrl.data.opponent.user, ctrl.vm.miniUser.opponent.data, ctrl.vm.miniUser.opponent.showing, function () { return ctrl.closeUserPopup('opponent'); })
    ];
}
function renderMaterial(material) {
    var children = [];
    for (var role in material) {
        var piece = <div className={role}/>;
        var count = material[role];
        var content = [];
        for (var i = 0; i < count; i++)
            content.push(piece);
        children.push(<div className="tomb" key={role}>{content}</div>);
    }
    return children;
}
exports.renderMaterial = renderMaterial;
function renderTitle(ctrl) {
    function tcConfig(vnode) {
        var el = vnode.dom;
        el.textContent =
            utils.formatTimeInSecs(ctrl.data.tournament.secondsToFinish) +
                ' • ';
        ctrl.vm.tClockEl = el;
    }
    if (ctrl.vm.offlineWatcher || socket_1["default"].isConnected()) {
        return (<h1 key="playingTitle" className="playing">
        {session_1["default"].isKidMode() ? <span className="kiddo">😊</span> : null}
        {ctrl.data.userTV ? <span className="withIcon" data-icon="1"/> : null}
        {ctrl.data.tournament ?
            <span className="fa fa-trophy"/> : null}
        {ctrl.data.tournament && ctrl.data.tournament.secondsToFinish ?
            <span oncreate={tcConfig}>
          {utils.formatTimeInSecs(ctrl.data.tournament.secondsToFinish) +
                ' • '}
          </span> : null}
        {ctrl.title}
        {ctrl.vm.offlineWatcher ? ' • Offline' : null}
      </h1>);
    }
    else {
        return (<h1 key="reconnectingTitle" className="reconnecting">
        {common_1.loader}
      </h1>);
    }
}
function renderHeader(ctrl) {
    return (<nav className={socket_1["default"].isConnected() ? '' : 'reconnecting'}>
      {!ctrl.data.tv && !ctrl.data.userTV && ctrl.data.player.spectator ? common_1.backButton(common_1.gameTitle(ctrl.data)) : common_1.menuButton()}
      {ctrl.data.tv || ctrl.data.userTV || !ctrl.data.player.spectator ? renderTitle(ctrl) : null}
      {common_1.headerBtns()}
    </nav>);
}
function renderContent(ctrl, isPortrait) {
    var material = chessground.board.getMaterialDiff(ctrl.chessground.data);
    var player = renderPlayTable(ctrl, ctrl.data.player, material[ctrl.data.player.color], 'player', isPortrait);
    var opponent = renderPlayTable(ctrl, ctrl.data.opponent, material[ctrl.data.opponent.color], 'opponent', isPortrait);
    var bounds = helper.getBoardBounds(helper.viewportDim(), isPortrait, 'game');
    var board = m(Board_1["default"], {
        data: ctrl.data,
        chessgroundCtrl: ctrl.chessground,
        bounds: bounds,
        isPortrait: isPortrait,
        alert: gameApi.mandatory(ctrl.data) && !ctrl.data.player.spectator && gameApi.nbMoves(ctrl.data, ctrl.data.player.color) === 0 ?
            i18n_1["default"]('youHaveNbSecondsToMakeYourFirstMove', ctrl.data.tournament.nbSecondsForFirstMove) : null
    });
    var orientationKey = isPortrait ? 'o-portrait' : 'o-landscape';
    if (isPortrait) {
        return m.fragment({ key: orientationKey }, [
            opponent,
            board,
            player,
            renderGameActionsBar(ctrl)
        ]);
    }
    else {
        return m.fragment({ key: orientationKey }, [
            board,
            <section className="table">
        <header className="tableHeader">
          {gameInfos(ctrl)}
        </header>
        <section className="playersTable">
          {opponent}
          {replay_1.renderTable(ctrl)}
          {player}
        </section>
        {renderGameActionsBar(ctrl)}
      </section>
        ]);
    }
}
function getChecksCount(ctrl, color) {
    var player = color === ctrl.data.player.color ? ctrl.data.opponent : ctrl.data.player;
    return player.checks;
}
function renderSubmitMovePopup(ctrl) {
    if (ctrl.vm.moveToSubmit || ctrl.vm.dropToSubmit) {
        return (<div className="overlay_popup_wrapper submitMovePopup">
      <div className="overlay_popup">
      {button_1["default"].submitMove(ctrl)}
      </div>
      </div>);
    }
    return null;
}
function userInfos(user, player, playerName, position) {
    var title;
    if (user) {
        var onlineStatus = user.online ? 'connected to lichess' : 'offline';
        var onGameStatus = player.onGame ? 'currently on this game' : 'currently not on this game';
        var engine = position === 'opponent' && user.engine ? i18n_1["default"]('thisPlayerUsesChessComputerAssistance') + '; ' : '';
        var booster = position === 'opponent' && user.booster ? i18n_1["default"]('thisPlayerArtificiallyIncreasesTheirRating') + '; ' : '';
        title = playerName + ": " + engine + booster + onlineStatus + "; " + onGameStatus;
    }
    else
        title = playerName;
    window.plugins.toast.show(title, 'short', 'center');
}
function renderAntagonistInfo(ctrl, player, material, position, isPortrait, isCrazy) {
    var user = player.user;
    if (player.ai) {
        player.engineName = ctrl.data.game.variant.key === 'crazyhouse' ?
            'Sunsetter' : 'Stockfish';
    }
    var playerName = utils.playerName(player, !isPortrait);
    var togglePopup = user ? function () { return ctrl.openUserPopup(position, user.id); } : utils.noop;
    var vConf = user ?
        helper.ontap(togglePopup, function () { return userInfos(user, player, playerName, position); }) :
        helper.ontap(utils.noop, function () { return window.plugins.toast.show(playerName, 'short', 'center'); });
    var onlineStatus = user && user.online ? 'online' : 'offline';
    var checksNb = getChecksCount(ctrl, player.color);
    var runningColor = ctrl.isClockRunning() ? ctrl.data.game.player : null;
    var tournamentRank = ctrl.data.tournament && ctrl.data.tournament.ranks ?
        '#' + ctrl.data.tournament.ranks[player.color] + ' ' : null;
    return (<div className={'antagonistInfos' + (isCrazy ? ' crazy' : '')} oncreate={vConf}>
      <h2 className="antagonistUser">
        {user ?
        <span className={'fa fa-circle status ' + onlineStatus}/> :
        null}
        {tournamentRank}
        {playerName}
        {player.onGame ?
        <span className="ongame yes" data-icon="3"/> :
        <span className="ongame no" data-icon="0"/>}
        {isCrazy && position === 'opponent' && user && (user.engine || user.booster) ?
        <span className="warning" data-icon="j"></span> : null}
      </h2>
      {!isCrazy ?
        <div className="ratingAndMaterial">
        {position === 'opponent' && user && (user.engine || user.booster) ?
            <span className="warning" data-icon="j"></span> : null}
        {user && isPortrait ?
            <h3 className="rating">
            {player.rating}
            {player.provisional ? '?' : ''}
            {helper.renderRatingDiff(player)}
          </h3> : null}
        {checksNb !== undefined ?
            <div className="checkCount">{checksNb}</div> : null}
        {ctrl.data.game.variant.key === 'horde' ? null : renderMaterial(material)}
      </div> : null}
      {isCrazy && ctrl.clock ?
        m(clockView_1["default"], { ctrl: ctrl.clock, color: player.color, runningColor: runningColor, isBerserk: ctrl.vm.goneBerserk[player.color] }) : (isCrazy && ctrl.correspondenceClock ?
        corresClockView_1.view(ctrl.correspondenceClock, player.color, ctrl.data.game.player) : null)}
    </div>);
}
function renderPlayTable(ctrl, player, material, position, isPortrait) {
    var runningColor = ctrl.isClockRunning() ? ctrl.data.game.player : null;
    var step = ctrl.plyStep(ctrl.vm.ply);
    var isCrazy = !!step.crazy;
    return (<section className={'playTable' + (isCrazy ? ' crazy' : '')}>
      {renderAntagonistInfo(ctrl, player, material, position, isPortrait, isCrazy)}
      {m(CrazyPocket_1["default"], {
        ctrl: ctrl,
        crazyData: step.crazy,
        color: player.color,
        position: position
    })}
      {!isCrazy && ctrl.clock ?
        m(clockView_1["default"], { ctrl: ctrl.clock, color: player.color, runningColor: runningColor, isBerserk: ctrl.vm.goneBerserk[player.color] }) : (!isCrazy && ctrl.correspondenceClock ?
        corresClockView_1.view(ctrl.correspondenceClock, player.color, ctrl.data.game.player) : null)}
    </section>);
}
function tvChannelSelector(ctrl) {
    var channels = perfs_1.perfTypes.filter(function (e) { return e[0] !== 'correspondence'; }).map(function (e) { return [e[1], e[0]]; });
    channels.unshift(['Top rated', 'best']);
    channels.push(['Computer', 'computer']);
    return m('div.action', m('div.select_input', form_1["default"].renderSelect('TV channel', 'tvChannel', channels, settings_1["default"].tv.channel, false, ctrl.onTVChannelChange)));
}
function renderGameRunningActions(ctrl) {
    if (ctrl.data.player.spectator) {
        var controls = [
            button_1["default"].shareLink(ctrl),
            ctrl.data.tv && ctrl.data.player.user ? button_1["default"].userTVLink(ctrl.data.player.user) : null,
            ctrl.data.tv && ctrl.data.player.user ? button_1["default"].userTVLink(ctrl.data.opponent.user) : null,
            ctrl.data.tv ? tvChannelSelector(ctrl) : null
        ];
        return <div className="game_controls">{controls}</div>;
    }
    var answerButtons = [
        button_1["default"].cancelDrawOffer(ctrl),
        button_1["default"].answerOpponentDrawOffer(ctrl),
        button_1["default"].cancelTakebackProposition(ctrl),
        button_1["default"].answerOpponentTakebackProposition(ctrl)
    ];
    var gameControls = button_1["default"].forceResign(ctrl) || [
        button_1["default"].standard(ctrl, gameApi.takebackable, 'i', 'proposeATakeback', 'takeback-yes'),
        button_1["default"].standard(ctrl, gameApi.drawable, '2', 'offerDraw', 'draw-yes'),
        button_1["default"].threefoldClaimDraw(ctrl),
        button_1["default"].resign(ctrl),
        button_1["default"].resignConfirmation(ctrl),
        button_1["default"].goBerserk(ctrl)
    ];
    return (<div className="game_controls">
      {button_1["default"].analysisBoard(ctrl)}
      {button_1["default"].shareLink(ctrl)}
      {button_1["default"].moretime(ctrl)}
      {button_1["default"].standard(ctrl, gameApi.abortable, 'L', 'abortGame', 'abort')}
      {gameControls}
      {answerButtons ? <div className="answers">{answerButtons}</div> : null}
    </div>);
}
function renderGameEndedActions(ctrl) {
    var result = gameApi.result(ctrl.data);
    var winner = gameApi.getPlayer(ctrl.data, ctrl.data.game.winner);
    var status = status_1["default"].toLabel(ctrl.data.game.status.name, ctrl.data.game.winner, ctrl.data.game.variant.key) +
        (winner ? '. ' + i18n_1["default"](winner.color === 'white' ? 'whiteIsVictorious' : 'blackIsVictorious') + '.' : '');
    var resultDom = status_1["default"].aborted(ctrl.data) ? [] : [
        m('strong', result), m('br')
    ];
    resultDom.push(m('em.resultStatus', status));
    var buttons;
    if (ctrl.data.game.tournamentId) {
        if (ctrl.data.player.spectator) {
            buttons = [
                button_1["default"].returnToTournament(ctrl),
                button_1["default"].shareLink(ctrl),
                button_1["default"].sharePGN(ctrl),
                button_1["default"].analysisBoard(ctrl)
            ];
        }
        else {
            buttons = [
                button_1["default"].returnToTournament(ctrl),
                button_1["default"].withdrawFromTournament(ctrl),
                button_1["default"].shareLink(ctrl),
                button_1["default"].sharePGN(ctrl),
                button_1["default"].analysisBoard(ctrl)
            ];
        }
    }
    else {
        if (ctrl.data.player.spectator) {
            buttons = [
                button_1["default"].shareLink(ctrl),
                ctrl.data.tv && ctrl.data.player.user ? button_1["default"].userTVLink(ctrl.data.player.user) : null,
                ctrl.data.tv && ctrl.data.player.user ? button_1["default"].userTVLink(ctrl.data.opponent.user) : null,
                button_1["default"].sharePGN(ctrl),
                button_1["default"].analysisBoard(ctrl),
                ctrl.data.tv ? tvChannelSelector(ctrl) : null
            ];
        }
        else {
            buttons = [
                button_1["default"].shareLink(ctrl),
                button_1["default"].sharePGN(ctrl),
                button_1["default"].newOpponent(ctrl),
                button_1["default"].answerOpponentRematch(ctrl),
                button_1["default"].cancelRematch(ctrl),
                button_1["default"].rematch(ctrl),
                button_1["default"].analysisBoard(ctrl)
            ];
        }
    }
    return (<div className="game_controls">
      <div className="result">{resultDom}</div>
      <div className="control buttons">{buttons}</div>
    </div>);
}
function gameInfos(ctrl) {
    var data = ctrl.data;
    var time = gameApi.time(data);
    var mode = data.game.rated ? i18n_1["default"]('rated') : i18n_1["default"]('casual');
    var icon = utils.gameIcon(data.game.perf);
    var variant = m('span.variant', {
        oncreate: helper.ontap(function () {
            var link = variant_1["default"](data.game.variant.key).link;
            if (link)
                window.open(link, '_blank');
        }, function () { return window.plugins.toast.show(data.game.variant.title, 'short', 'center'); })
    }, data.game.variant.name);
    var infos = [time + ' • ', variant, m('br'), mode];
    return [
        m('div.icon-game', {
            'data-icon': icon ? icon : ''
        }),
        m('div.game-title.no_select', infos),
        session_1["default"].isConnected() ? m('button.star', {
            oncreate: helper.ontap(ctrl.toggleBookmark, function () { return window.plugins.toast.show(i18n_1["default"]('bookmarkThisGame'), 'short', 'center'); }),
            'data-icon': data.bookmarked ? 't' : 's'
        }) : null
    ];
}
function renderGamePopup(ctrl, isPortrait) {
    return popup_1["default"]('player_controls', isPortrait ? function () { return gameInfos(ctrl); } : null, gameApi.playable(ctrl.data) ?
        function () { return renderGameRunningActions(ctrl); } : function () { return renderGameEndedActions(ctrl); }, ctrl.vm.showingActions, ctrl.hideActions);
}
function renderGameActionsBar(ctrl) {
    var answerRequired = ctrl.data.opponent.proposingTakeback ||
        ctrl.data.opponent.offeringDraw ||
        gameApi.forceResignable(ctrl.data) ||
        ctrl.data.opponent.offeringRematch;
    var gmClass = (ctrl.data.opponent.proposingTakeback ? [
        'fa',
        'fa-mail-reply'
    ] : [
        'fa',
        'fa-ellipsis-h'
    ]).concat([
        'action_bar_button',
        answerRequired ? 'glow' : ''
    ]).join(' ');
    var gmDataIcon = ctrl.data.opponent.offeringDraw ? '2' : null;
    var gmButton = gmDataIcon ?
        <button className={gmClass} data-icon={gmDataIcon} key="gameMenu" oncreate={helper.ontap(ctrl.showActions)}/> :
        <button className={gmClass} key="gameMenu" oncreate={helper.ontap(ctrl.showActions)}/>;
    var chatClass = [
        'action_bar_button',
        ctrl.chat && ctrl.chat.unread ? 'glow' : ''
    ].join(' ');
    return (<section className="actions_bar">
      {gmButton}
      {ctrl.chat ?
        <button className={chatClass} data-icon="c" key="chat" oncreate={helper.ontap(ctrl.chat.open)}/> : null}
      {ctrl.notes ? button_1["default"].notes(ctrl) : null}
      {button_1["default"].flipBoard(ctrl)}
      {button_1["default"].first(ctrl)}
      {button_1["default"].backward(ctrl)}
      {button_1["default"].forward(ctrl)}
      {button_1["default"].last(ctrl)}
    </section>);
}
