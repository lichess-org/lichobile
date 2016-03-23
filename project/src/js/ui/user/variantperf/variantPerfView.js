import * as utils from '../../../utils';
import helper from '../../helper';
import { header as headerWidget, backButton } from '../../shared/common';
import layout from '../../layout';
import i18n from '../../../i18n';
import m from 'mithril';
import {shortPerfTitle} from '../../../lichess/perfs';

export default function view(ctrl) {
  const header = utils.partialf(headerWidget, null,
    backButton(ctrl.user() ? (ctrl.user().username + ' ' + shortPerfTitle(ctrl.variant) + ' stats') : '')
  );

  function renderBody() {
    const data = ctrl.variantPerfData();

    if (!data) return null;

    const days = Math.floor(data.stat.count.seconds / (60 * 60 * 24));
    const hours = Math.floor(data.stat.count.seconds / (60 * 60)) - days * 24;
    const mins = Math.floor(data.stat.count.seconds / 60) - days * 24 * 60 - hours * 60;

    return (
      <div class="variantPerfBody native_scroller page">
        <table class="variantPerf">
          <tbody>
          <tr>
            <th class="variantPerfHeading" colspan="3"> Current Rating </th>
          </tr>
          <tr>
            <th class="variantPerf"> {i18n('rating')} </th>
            <td class="variantPerf"> {Math.round(data.perf.glicko.rating) + (data.perf.glicko.provisional ? '?' : '')} </td>
            <td> </td>
          </tr>
          <tr class={isEmpty(data.perf.progress)}>
            <th class="variantPerf"> Last 12 games progress </th>
            <td class="variantPerf"> {helper.progress(data.perf.progress)} </td>
            <td> </td>
          </tr>
          <tr class={isEmpty(data.rank)}>
            <th class="variantPerf"> {i18n('rank')} </th>
            <td class="variantPerf"> {data.rank === null ? '' : data.rank} </td>
            <td> </td>
          </tr>
          <tr class={isEmpty(data.percentile)}>
            <th class="variantPerf"> Percentile </th>
            <td class="variantPerf"> {data.percentile === null ? '' : (data.percentile + '%')} </td>
            <td> </td>
          </tr>
          <tr> <td class="variantPerfSpacer" colspan="3"> </td> </tr>
          <tr>
            <th class="variantPerfHeading" colspan="3"> Other {i18n('rating')} Statistics </th>
          </tr>
          <tr>
            <th class="variantPerf"> Avg opponent {i18n('rating').toLowerCase()} </th>
            <td class="variantPerf"> {Math.round(data.stat.count.opAvg)} </td>
            <td> </td>
          </tr>
          <tr class={isEmpty(data.stat.highest)}>
            <th class="variantPerf"> Highest {i18n('rating').toLowerCase()} </th>
            <td class="variantPerf"> <span class="progress positive"> {data.stat.highest ? data.stat.highest.int : ''} </span> </td>
            <td class="variantPerf"> <span class="progress positive"> {data.stat.highest ? data.stat.highest.at.substring(0, 10) : ''} </span> </td>
          </tr>
          <tr class={isEmpty(data.stat.lowest)}>
            <th class="variantPerf"> Lowest {i18n('rating').toLowerCase()} </th>
            <td class="variantPerf"> <span class="progress positive"> {data.stat.lowest ? data.stat.lowest.int : ''} </span> </td>
            <td class="variantPerf"> <span class="progress positive"> {data.stat.lowest ? data.stat.lowest.at.substring(0, 10) : ''} </span> </td>
          </tr>
          <tr>
            <th class="variantPerf"> {i18n('tpTimeSpentPlaying', 0).split(':')[0]} </th>
            <td class="variantPerf" colspan="2"> { (days > 0 ? (days + 'd, ') : '') + hours + 'h, ' + mins + 'm' } </td>
          </tr>
          <tr> <td class="variantPerfSpacer" colspan="3"> </td> </tr>
          <tr>
            <th class="variantPerfHeading" colspan="3"> Game Stats </th>
          </tr>
          <tr>
            <th class="variantPerf"> {i18n('wins')} </th>
            <td class="variantPerf"> <span class="progress positive"> {data.stat.count.win} </span> </td>
            <td class="variantPerf"> <span class="progress positive"> {Math.round((data.stat.count.win / data.stat.count.all) * 100) + '%'} </span> </td>
          </tr>
          <tr>
            <th class="variantPerf"> {toTitleCase(i18n('nbDraws', 0).split(' ')[1])} </th>
            <td class="variantPerf"> {data.stat.count.draw} </td>
            <td class="variantPerf"> {Math.round((data.stat.count.draw / data.stat.count.all) * 100) + '%'} </td>
          </tr>
          <tr>
            <th class="variantPerf"> {i18n('losses')} </th>
            <td class="variantPerf sumLine"> <span class="progress negative"> {data.stat.count.loss} </span> </td>
            <td class="variantPerf"> <span class="progress negative"> {Math.round((data.stat.count.loss / data.stat.count.all) * 100) + '%'} </span> </td>
          </tr>
          <tr>
            <th class="variantPerf"> Total </th>
            <td class="variantPerf"> {data.stat.count.all} </td>
            <td> </td>
          </tr>
          <tr>
            <th class="variantPerfMemo"> {i18n('rated')} </th>
            <td class="variantPerfMemo"> {data.stat.count.rated} </td>
            <td class="variantPerfMemo"> {Math.round((data.stat.count.rated / data.stat.count.all) * 100) + '%'} </td>
          </tr>
          <tr>
            <th class="variantPerfMemo"> {i18n('tournament')} </th>
            <td class="variantPerfMemo"> {data.stat.count.tour} </td>
            <td class="variantPerfMemo"> {Math.round((data.stat.count.tour / data.stat.count.all) * 100) + '%'} </td>
          </tr>
          <tr>
            <th class="variantPerfMemo"> Berserk </th>
            <td class="variantPerfMemo"> {data.stat.count.berserk} </td>
            <td class="variantPerfMemo"> {Math.round((data.stat.count.berserk / data.stat.count.all) * 100) + '%'} </td>
          </tr>
          <tr>
            <th class="variantPerfMemo"> Disconnect </th>
            <td class="variantPerfMemo" > {data.stat.count.disconnects} </td>
            <td class="variantPerfMemo"> {Math.round((data.stat.count.disconnects / data.stat.count.all) * 100) + '%'} </td>
          </tr>
          <tr> <td class="variantPerfSpacer" colspan="3"> </td> </tr>
          <tr>
            <th class="variantPerfHeading" colspan="3"> Streaks </th>
          </tr>
          <tr class={isEmpty(data.stat.playStreak)}>
            <th class="variantPerf"> Playing streak </th>
            <td class="variantPerf"> {data.stat.playStreak.nb.max.v} </td>
            <td class="variantPerf"> {data.stat.playStreak.lastDate.substring(0, 10)} </td>
          </tr>
          <tr class={isEmpty(data.stat.resultStreak.win.max.v)}>
            <th class="variantPerf"> {i18n('winStreak')} </th>
            <td class="variantPerf"> <span class="progress positive"> {data.stat.resultStreak.win.max.v ? data.stat.resultStreak.win.max.v : ''} </span> </td>
            <td class="variantPerf"> <span class="progress positive"> {data.stat.resultStreak.win.max.to ? data.stat.resultStreak.win.max.to.at.substring(0, 10) : ''} </span> </td>
          </tr>
          <tr class={isEmpty(data.stat.resultStreak.loss.max.v)}>
            <th class="variantPerf"> Losing streak </th>
            <td class="variantPerf"> <span class="progress negative"> {data.stat.resultStreak.loss.max.v ? data.stat.resultStreak.loss.max.v : ''} </span> </td>
            <td class="variantPerf"> <span class="progress negative"> {data.stat.resultStreak.loss.max.to ? data.stat.resultStreak.loss.max.to.at.substring(0, 10) : ''} </span> </td>
          </tr>
          <tr> <td class="variantPerfSpacer" colspan="3"> </td> </tr>
          </tbody>
        </table>
        <div class={'variantPerfGames noPadding ' + isEmpty(data.stat.bestWins.results.length)}>
          <div class="variantPerfHeading"> Best Wins </div>
          {data.stat.bestWins.results.map(p => renderGame(p))}
        </div>
      </div>
    );
  }

  return layout.free(header, renderBody);
}

function renderGame(game) {
  var opp = (game.opId.title === null ? '' : game.opId.title) + ' ' + game.opId.name;
  var date = game.at.substring(0, 10);
  var gameId = game.gameId;

  return (
    <div class="list_item nav" config={helper.ontouchY(() => m.route('/game/' + gameId))}>
      {opp} ({date})
    </div>
  );
}

function isEmpty(element) {
  if (!element)
    return 'empty';
  else
    return '';
}

function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}
