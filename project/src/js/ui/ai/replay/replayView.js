/** @jsx m */
import h from '../../helper';

function renderTd(step, curPly) {
  return step ? (
    <td className={'replayMove' + (step.ply === curPly ? ' current' : '')}>
      {step.san}
    </td>
  ) : null;
}

function renderTable(ctrl, curPly) {
  const steps = ctrl.situations;
  const pairs = [];
  for (let i = 1; i < steps.length; i += 2) pairs.push([steps[i], steps[i + 1]]);
  return (
    <table className="moves">
      <tbody>
        {pairs.map(function(pair, i) {
          return (
            <tr>
              <td className="replayMoveIndex">{ (i + 1) + '.' }</td>
              {renderTd(pair[0], curPly)}
              {renderTd(pair[1], curPly)}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function renderButtons(ctrl, curPly) {
  var nbMoves = ctrl.situations.length;
  return m('div.buttons', [
    ['first', 'W', 1],
    ['prev', 'Y', curPly - 1],
    ['next', 'X', curPly + 1],
    ['last', 'V', nbMoves]
  ].map(function(b) {
    var enabled = curPly !== b[2] && b[2] >= 1 && b[2] <= nbMoves;
    return m('a', {
      class: 'button ' + b[0] + ' ' + h.classSet({
        disabled: !enabled,
        glowing: ctrl.late && b[0] === 'last'
      }),
      'data-icon': b[1],
      config: enabled ? h.ontouch(ctrl.jump.bind(undefined, b[2])) : null
    });
  }));
}

function autoScroll(movelist) {
  var plyEl = movelist.querySelector('.current') || movelist.querySelector('tr:first-child');
  if (plyEl) movelist.scrollTop = plyEl.offsetTop - movelist.offsetHeight / 2 + plyEl.offsetHeight / 2;
}

export function view(ctrl) {
  const curPly = ctrl.ply;
  const shouldDisplay = h.isLandscape();
  const hash = curPly + ctrl.situationsHash(ctrl.situations) + shouldDisplay;

  if (ctrl.hash === hash) return {subtree: 'retain'};
  ctrl.hash = hash;

  if (!shouldDisplay) return null;

  return (
    <div key="replay-table" className="replay">
      <div className="gameMovesList native_scroller"
        config={(el, isUpdate) => {
          autoScroll(el);
          if (!isUpdate) setTimeout(autoScroll.bind(undefined, el), 100);
        }}
      >
        {renderTable(ctrl, curPly)}
      </div>
    </div>
  );
}
