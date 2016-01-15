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

    <tr>
      <th> Time spent playing </th>
      <td colspan=2> { (days > 0 ? (days+"d, ") : "") + hours + "h, " + mins + "m" } </td>
    </tr>
    */
    return (
      <div class="variantPerfBody">
        <section class="variantBasicPerfInfo">
          <p> Current Rating: {data.perf.glicko.rating + (data.perf.glicko.provisional ? "?" : "")} </p>
          <p> Current Ranking: {data.rank} </p>
          <p> Current Percentile: {data.percentile + "%"} </p>
        </section>
        <p/>
        <table>
          <tbody>
            <tr>
              <th> Total games </th>
              <td> {data.stat.count.all} </td>
              <td> </td>
            </tr>
            <tr>
              <th> Rated games </th>
              <td> {data.stat.count.rated} </td>
              <td> {Math.round((data.stat.count.rated/data.stat.count.all)*100) + "%"} </td>
            </tr>
            <tr>
              <th> Tournament games </th>
              <td> {data.stat.count.tour} </td>
              <td> {Math.round((data.stat.count.tour/data.stat.count.all)*100) + "%"} </td>
            </tr>
            <tr>
              <th> Tournament games </th>
              <td> {data.stat.count.berserk} </td>
              <td> {Math.round((data.stat.count.berserk/data.stat.count.all)*100) + "%"} </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return layout.free(header, renderBody, empty, empty);
}
