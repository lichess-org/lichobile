import * as utils from '../../../utils';
import helper from '../../helper';
import { header as headerWidget, backButton, empty } from '../../shared/common';
import layout from '../../layout';
import gameApi from '../../../lichess/game';
import i18n from '../../../i18n';
import gameStatus from '../../../lichess/status';
import { toggleGameBookmark } from '../../../xhr';
import session from '../../../session';
import m from 'mithril';
import ViewOnlyBoard from '../../shared/ViewOnlyBoard';

export default function view(ctrl) {
  const header = utils.partialf(headerWidget, null,
    backButton(ctrl.user() ? (ctrl.user().username + ' ' + ctrl.variant + ' Stats') : '')
  );

  function renderBody() {
    const data = ctrl.variantPerfData();
    const days = Math.floor(data.stat.count.seconds/(60*60*24));
    const hours = Math.floor(data.stat.count.seconds/(60*60)) - days*24;
    const mins = Math.floor(data.stat.count.seconds/(60)) - days*24*60 - hours*60;
    /*
    Unclear where to put these or if they are actually useful
    <tr>
      <th class="variantPerf"> Disconnects </th>
      <td class="variantPerf" > {data.stat.count.disconnects} </td>
      <td class="variantPerf"> {Math.round((data.stat.count.disconnects/data.stat.count.all)*100) + "%"} </td>
    </tr>
    <tr>
      <th class="variantPerf"> Rated </th>
      <td class="variantPerf"> {data.stat.count.rated} </td>
      <td class="variantPerf"> {Math.round((data.stat.count.rated/data.stat.count.all)*100) + "%"} </td>
    </tr>
    <tr>
      <th class="variantPerf"> Tournament </th>
      <td class="variantPerf"> {data.stat.count.tour} </td>
      <td class="variantPerf"> {Math.round((data.stat.count.tour/data.stat.count.all)*100) + "%"} </td>
    </tr>
    */
    return (
      <div class="variantPerfBody native_scroller page">
      <table class="variantPerf">
        <tbody>
        <tr>
          <th class="variantPerfHeading" colspan="3"> Current Rating </th>
        </tr>
        <tr>
          <th class="variantPerf"> Rating </th>
          <td class="variantPerf"> {Math.round(data.perf.glicko.rating) + (data.perf.glicko.provisional ? "?" : "")} </td>
          <td> </td>
        </tr>
        <tr>
          <th class="variantPerf"> Last 12 Games Progress </th>
          <td class="variantPerf"> {helper.progress(data.perf.progress)} </td>
          <td> </td>
        </tr>
        <tr>
          <th class="variantPerf"> Ranking </th>
          <td class="variantPerf"> {data.rank === null ? "" : data.rank} </td>
          <td> </td>
        </tr>
        <tr>
          <th class="variantPerf"> Percentile </th>
          <td class="variantPerf"> {data.percentile === null ? "" : (data.percentile+ "%")} </td>
          <td> </td>
        </tr>
        <tr> <td class="variantPerfSpacer" colspan="3"> </td> </tr>
        <tr>
          <th class="variantPerfHeading" colspan="3"> Other Rating Stats </th>
        </tr>
        <tr>
          <th class="variantPerf"> Avg op rating </th>
          <td class="variantPerf"> {Math.round(data.stat.count.opAvg)} </td>
          <td> </td>
        </tr>
        <tr>
          <th class="variantPerf"> Highest rating </th>
          <td class="variantPerf"> <span class="progress positive"> {data.stat.highest.int} </span> </td>
          <td class="variantPerf"> <span class="progress positive"> {data.stat.highest.at.substring(0,10)} </span> </td>
        </tr>
        <tr>
          <th class="variantPerf"> Lowest rating </th>
          <td class="variantPerf"> <span class="progress negative"> {data.stat.lowest.int} </span> </td>
          <td class="variantPerf"> <span class="progress negative"> {data.stat.lowest.at.substring(0,10)} </span> </td>
        </tr>
        <tr>
          <th class="variantPerf"> Time playing </th>
          <td class="variantPerf" colspan="2"> { (days > 0 ? (days+"d, ") : "") + hours + "h, " + mins + "m" } </td>
          <td> </td>
        </tr>
        <tr> <td class="variantPerfSpacer" colspan="3"> </td> </tr>
        <tr>
          <th class="variantPerfHeading" colspan="3"> Game Stats </th>
        </tr>
        <tr>
          <th class="variantPerf"> Victories </th>
          <td class="variantPerf"> <span class="progress positive"> {data.stat.count.win} </span> </td>
          <td class="variantPerf"> <span class="progress positive"> {Math.round((data.stat.count.win/data.stat.count.all)*100) + "%"} </span> </td>
        </tr>
        <tr>
          <th class="variantPerf"> Draws </th>
          <td class="variantPerf"> {data.stat.count.draw} </td>
          <td class="variantPerf"> {Math.round((data.stat.count.draw/data.stat.count.all)*100) + "%"} </td>
        </tr>
        <tr>
          <th class="variantPerf"> Defeats </th>
          <td class="variantPerf sumLine"> <span class="progress negative"> {data.stat.count.loss} </span> </td>
          <td class="variantPerf"> <span class="progress negative"> {Math.round((data.stat.count.loss/data.stat.count.all)*100) + "%"} </span> </td>
        </tr>
        <tr>
          <th class="variantPerf"> Total </th>
          <td class="variantPerf"> {data.stat.count.all} </td>
          <td> </td>
        </tr>
        <tr> <td class="variantPerfSpacer" colspan="3"> </td> </tr>
        </tbody>
      </table>
      <table class="variantPerf">
        <tbody>
          <tr>
            <th class="variantPerfHeading" colspan="2"> Best Victories </th>
          </tr>
          {data.stat.bestWins.results.map(p => renderGame(p))}
          <tr> <td class="variantPerfSpacer" colspan="2"> </td> </tr>
          <tr>
            <th class="variantPerfHeading" colspan="2"> Worst Defeats </th>
          </tr>
          {data.stat.worstLosses.results.map(p => renderGame(p))}
        </tbody>
      </table>
      </div>
    );
  }

  return layout.free(header, renderBody, empty, empty);
}

function renderGame(game) {
  var opp = (game.opId.title === null ? "" : game.opId.title) + " " + game.opId.name;
  var date = game.at.substring(0,10);
  return (
    <tr>
      <th class="variantPerf"> {opp} </th>
      <td class="variantPerf"> {date} </td>
      <td> </td>
    </tr>
  )
}
