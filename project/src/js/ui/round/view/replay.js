import helper from '../../helper';

const emptyTd = <td className="move">...</td>;

function renderTd(ctrl, step, curPly, orEmpty) {
  return step ? (
    <td className={'replayMove' + (step.ply === curPly ? ' current' : '')}
      config={helper.ontouchY(() => ctrl.jump(step.ply))}
      data-ply={step.ply}
    >
      {step.san}
    </td>
  ) : (orEmpty ? emptyTd : null);
}

function renderTr(ctrl, index, pairs, curPly) {
  return (
    <tr>
      <td className="replayMoveIndex">{ (index + 1) + '.' }</td>
      {renderTd(ctrl, pairs[index][0], curPly, true)}
      {renderTd(ctrl, pairs[index][1], curPly, false)}
    </tr>
  );
}

function autoScroll(movelist) {
  if (!movelist) return;
  var plyEl = movelist.querySelector('.current') || movelist.querySelector('tr:first-child');
  if (plyEl) movelist.scrollTop = plyEl.offsetTop - movelist.offsetHeight / 2 + plyEl.offsetHeight / 2;
}

export function renderTable(ctrl) {
  const steps = ctrl.data.steps;
  const firstPly = ctrl.firstPly();
  const h = ctrl.vm.ply + ctrl.stepsHash(ctrl.data.steps) +
    ctrl.data.game.status.id + ctrl.data.game.winner;

  if (ctrl.vm.replayHash === h) return { subtree: 'retain' };
  ctrl.vm.replayHash = h;

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
        config={(el, isUpdate) => {
          autoScroll(el);
          if (!isUpdate) setTimeout(autoScroll.bind(undefined, el), 100);
        }}
      >
        <table className="moves">
          <tbody>
            {trs}
          </tbody>
        </table>
      </div>
    </div>
  );
}
