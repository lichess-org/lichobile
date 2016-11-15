import * as m from 'mithril';
import router from '../../router';
import i18n from '../../i18n';
import settings from '../../settings';
import formWidgets from '../shared/form';
import ViewOnlyBoard from '../shared/ViewOnlyBoard';
import popupWidget from '../shared/popup';
import * as helper from '../helper';
import { AiRoundInterface } from '../shared/round';
import * as stream from 'mithril/stream';

const colors = [
  ['white', 'white'],
  ['black', 'black'],
  ['randomColor', 'random']
];

export interface NewAiGameCtrl {
  open: () => void
  close: (fromBB?: string) => void
  isOpen: Mithril.Stream<boolean>
  root: AiRoundInterface
}

export default {

  controller(root: AiRoundInterface) {
    const isOpen = stream(false);

    function open() {
      router.backbutton.stack.push(close);
      isOpen(true);
    }

    function close(fromBB?: string) {
      if (fromBB !== 'backbutton' && isOpen() === true) router.backbutton.stack.pop();
      isOpen(false);
    }

    return {
      open,
      close,
      isOpen,
      root
    };
  },

  view(ctrl: NewAiGameCtrl) {
    if (ctrl.isOpen()) {
      return popupWidget(
        'new_offline_game',
        null,
        function() {
          const availVariants = settings.ai.availableVariants;
          const variants = ctrl.root.vm.setupFen ?
            availVariants.filter(i => !['racingKings', 'horde'].includes(i[1])) :
            availVariants;
          if (ctrl.root.vm.setupFen && ['racingKings', 'horde'].includes(settings.ai.variant())) {
            settings.ai.variant('standard');
          }
          return (
            <div>
              <div className="action">
                {sideSelector()}
                <div className="select_input">
                  {formWidgets.renderSelect('variant', 'variant', variants, settings.ai.variant)}
                </div>
                { ctrl.root.vm.setupFen ?
                  <div className="from_position_wrapper">
                    <p>{i18n('fromPosition')}</p>
                    <div className="from_position">
                      <div className="setupMiniBoardWrapper"
                        oncreate={helper.ontap(() => {
                          router.set(`/editor/${encodeURIComponent(ctrl.root.vm.setupFen)}`);
                        })}
                      >
                        {m(ViewOnlyBoard, { fen: ctrl.root.vm.setupFen })}
                      </div>
                    </div>
                  </div> : null
                }
              </div>
              <button className="newGameButton" data-icon="E"
                oncreate={helper.ontap(() =>
                  ctrl.root.startNewGame(settings.ai.variant() as VariantKey, ctrl.root.vm.setupFen))
                }>
                {i18n('play')}
              </button>
            </div>
          );
        },
        ctrl.isOpen(),
        () => {
          if (ctrl.root.vm.setupFen) {
            router.set('/ai');
          }
          ctrl.close();
        }
      );
    }

    return null;
  }
};

function sideSelector() {
  return (
    <div className="select_input">
      {formWidgets.renderSelect('side', 'color', colors, settings.ai.color)}
    </div>
  );
}
