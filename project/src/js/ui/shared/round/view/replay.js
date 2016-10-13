import * as helper from '../../../helper';
import settings from '../../../settings';

const emptyTd = <td className="move">...</td>;

function renderTd(ctrl, step, curPly, orEmpty) {
  return step ? (
    <td className={'replayMove' + (step.ply === curPly ? ' current' : '')}
      data-ply={step.ply}
    >
      {step.san}
    </td>
  ) : (orEmpty ? emptyTd : null);
}

function renderTr(ctrl, index, pairs, curPly) {
  const first = pairs[index][0];
  const second = pairs[index][1];
  return (
    <tr>
      <td className="replayMoveIndex">{ (index + 1) + '.' }</td>
      {renderTd(ctrl, first, curPly, true)}
      {renderTd(ctrl, second, curPly, false)}
    </tr>
  );
}

function autoScroll(movelist) {
  if (!movelist) return;
  var plyEl = movelist.querySelector('.current') || movelist.querySelector('tr:first-child');
  if (plyEl) movelist.scrollTop = plyEl.offsetTop - movelist.offsetHeight / 2 + plyEl.offsetHeight / 2;
}

function getTdEl(e) {
  return e.target;
}

function onTableTap(ctrl, e) {
  const ply = e.target.dataset.ply;
  if (ply) ctrl.jump(Number(ply));
}

export function renderTable(ctrl) {
  const steps = ctrl.data.steps;
  const firstPly = ctrl.firstPly();

  const pairs = [];
  if (firstPly % 2 === 0) {
    for (let i = 1, len = steps.length; i < len; i += 2)
      pairs.push([steps[i], steps[i + 1]]);
  } else {
    pairs.push([null, steps[1]]);
    for (let i = 2, len = steps.length; i < len; i += 2)
      pairs.push([steps[i], steps[i + 1]]);
  }

  const trs = [];
  for (let i = 0, len = pairs.length; i < len; i++)
    trs.push(renderTr(ctrl, i, pairs, ctrl.vm.ply));

  return (
    <div key="replay-table" className="replay">
      <div className="gameMovesList native_scroller"
        oncreate={(vnode) => {
          setTimeout(autoScroll.bind(undefined, vnode.dom), 100);
        }}
        onupdate={(vnode) => { autoScroll(vnode.dom); }}
      >
        <table className={'moves' + (settings.game.pieceNotation() ? ' displayPieces' : '')}
          oncreate={helper.ontap(e => onTableTap(ctrl, e), null, null, false, getTdEl)}
        >
          <tbody>
            {trs}
          </tbody>
        </table>
      </div>
    </div>
  );
}
