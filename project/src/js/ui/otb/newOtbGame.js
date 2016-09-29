import * as m from 'mithril';
import i18n from '../../i18n';
import router from '../../router';
import settings from '../../settings';
import ViewOnlyBoard from '../shared/ViewOnlyBoard';
import formWidgets from '../shared/form';
import popupWidget from '../shared/popup';
import * as helper from '../helper';
import backbutton from '../../backbutton';

export default {

  controller: function(root) {
    let isOpen = false;

    function open() {
      backbutton.stack.push(close);
      isOpen = true;
    }

    function close(fromBB) {
      if (fromBB !== 'backbutton' && isOpen) backbutton.stack.pop();
      isOpen = false;
    }

    return {
      open: open,
      close: close,
      isOpen: function() {
        return isOpen;
      },
      root: root
    };
  },

  view: function(ctrl) {
    if (ctrl.isOpen()) {
      return popupWidget(
        'new_offline_game',
        null,
        function() {
          const availVariants = settings.otb.availableVariants;
          const variants = ctrl.root.vm.setupFen ?
            availVariants.filter(i => !['racingKings', 'horde'].includes(i[1])) :
            availVariants;
          if (ctrl.root.vm.setupFen && ['racingKings', 'horde'].includes(settings.otb.variant())) {
            settings.otb.variant('standard');
          }
          return (
            <div>
              <div className="action">
                <div className="select_input">
                  {formWidgets.renderSelect('variant', 'variant', variants, settings.otb.variant)}
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
                  ctrl.root.startNewGame(settings.otb.variant(), ctrl.root.vm.setupFen))
                }>
                {i18n('play')}
              </button>
            </div>
          );
        },
        ctrl.isOpen(),
        () => {
          if (ctrl.root.vm.setupFen) {
            router.set('/otb');
          }
          ctrl.close();
        }
      );
    }

    return null;
  }
};

