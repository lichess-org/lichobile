import router from '../../router';
import * as helper from '../helper';
import { FaqState, Tournament } from './interfaces';
import { closeIcon } from '../shared/icons'

export default {
  controller: function(tournament: Mithril.Stream<Tournament>) {
    let isOpen = false;

    function open() {
      router.backbutton.stack.push(close);
      isOpen = true;
    }

    function close(fromBB?: string) {
      if (fromBB !== 'backbutton' && isOpen) router.backbutton.stack.pop();
      isOpen = false;
    }

    return {
      open,
      close,
      isOpen: function() {
        return isOpen;
      },
      tournament
    } as FaqState;
  },

  view: function(ctrl: FaqState) {
    if (!ctrl.isOpen()) return null;
    const tournament = ctrl.tournament();

    if (!tournament) return null;
    return (
      <div className="modal" id="tournamentFaqModal" oncreate={helper.slidesInUp}>
        <header>
          <button className="modal_close"
            oncreate={helper.ontap(helper.slidesOutDown(ctrl.close, 'tournamentFaqModal'))}
          >
            { closeIcon }
          </button>
          <h2>Tournament FAQ</h2>
        </header>
        <div className="modal_content">
          <div className="tournamentFaq">
            <h2>Is it rated?</h2>
              Some tournaments are rated and will affect your rating.
            <h2>How are scores calculated?</h2>
            { tournament.system === 'arena' ?
              <div>
                A win has a base score of 2 points, a draw: 1 point, and a loss is worth no points.
                If you win two games consecutively you will start a double point streak, known as a
                <strong className="streak"> Streak Starter</strong>.
                The following games will continue to be worth <strong className="double">Double Points</strong> until you fail to win
                a game. That is, a win will be worth 4 points, a draw 2 points, and a loss will remain
                worth no point.
                <br />
                For example, two wins followed by a draw will be worth 6 points: 2 + 2 + (2 x 1)

                <h2>Arena Berserk</h2>
                When a player clicks the <em>Berserk</em> button at the beginning of the game,
                they lose half of their clock time, but the win is worth one extra tournament point.
                <br />
                Going <em>Berserk</em> in time controls with an increment also cancels the increment.
                (1+2 is an exception, it gives 1+0)
                <br />
                <em>Berserk</em> is not available for games with zero initial time (0+1, 0+2).
                <br />
                <em>Berserk</em> only grants an extra point if you play at least 7 moves in the game.
              </div> :
              <div>
                How scores are calculated depends on the system used for the tournament. In
                all cases a win is worth twice as much as a draw, and a loss is worth no
                points. In the Arena system, winning games in succession yields an additional bonus.
              </div>
            }

            <h2>How is the winner decided?</h2>
            The player(s) with the most points at the conclusion of the tournament's set time limit
            will be announced winner(s).

            <h2>How does the pairing work?</h2>
            { tournament.system === 'arena' ?
              <div>
                At the beginning of the tournament, players are paired based on their rating.
                As soon as you finish a game, return to the tournament lobby:
                you will then be paired with a player close to your ranking. This ensures minimum wait time,
                however you may not face all other players in the tournament.
                Play fast and return to the lobby to play more games and win more points.
              </div> :
              <div>
                The pairing mechanism depends on the system used for the tournament. In the
                Arena system, new pairings are generated as soon as enough players are
                available in the lobby, in with the Swiss system, pairings are generated on
                a round basis.
              </div>
            }

            <h2>How does it end?</h2>
            The tournament has a countdown clock.
            When it reaches zero, the tournament rankings are frozen, and the winner is announced.
            Games in progress must be finished, however they don't count for the tournament.

            <h2>Other important rules.</h2>
            You are required to make your first move within 20 seconds of your turn. Failing to make
            a move in this time will forfeit the game to your opponent.
            <br />
            Drawing the game within the first 10 moves of play will earn neither player any points.
          </div>
        </div>
      </div>
    );
  }
};
