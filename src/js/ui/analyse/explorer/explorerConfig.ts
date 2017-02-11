import * as h from 'mithril/hyperscript';
import * as helper from '../../helper';
import router from '../../../router';
import settings, { SettingsProp } from '../../../settings';
import * as stream from 'mithril/stream';

interface Data {
  db: {
    available: string[]
    selected: SettingsProp<string>
  },
  rating: {
    available: number[]
    selected: SettingsProp<number[]>
  },
  speed: {
    available: string[]
    selected: SettingsProp<string[]>
  }
}

interface Controller {
  open: Mithril.Stream<boolean>
  data: Data
  toggleOpen(): void
  toggleDb(db: string): void
  toggleRating(v: number): void
  toggleSpeed(v: string): void
  fullHouse(): boolean
  serialize(): string
}

export default {

  controller(variant: Variant, onClose: (changed: boolean) => void) {
    const available = ['lichess'];
    if (variant.key === 'standard' || variant.key === 'fromPosition') {
      available.push('masters');
    }

    const open = stream(false);

    const data = {
      db: {
        available: available,
        selected: available.length > 1 ? settings.analyse.explorer.db : function() {
          return available[0];
        }
      },
      rating: {
        available: settings.analyse.explorer.availableRatings,
        selected: settings.analyse.explorer.rating
      },
      speed: {
        available: settings.analyse.explorer.availableSpeeds,
        selected: settings.analyse.explorer.speed
      }
    };

    let openedWith: string;

    function serialize() {
      return JSON.stringify(['db', 'rating', 'speed'].map(k =>
        data[k].selected()
      ));
    }

    function doOpen() {
      router.backbutton.stack.push(doClose);
      openedWith = serialize();
      open(true);
    }

    function doClose(fromBB?: string) {
      if (fromBB !== 'backbutton' && open()) router.backbutton.stack.pop();
      open(false);
      onClose(openedWith !== serialize());
    }

    function toggleMany(c: SettingsProp<any>, value: any) {
      if (c().indexOf(value) === -1) c(c().concat([value]));
      else if (c().length > 1) c(c().filter((v: any) => {
        return v !== value;
      }));
    }

    return {
      open,
      data,
      toggleOpen() {
        if (open()) doClose();
        else doOpen();
      },
      toggleDb(db: string) {
        data.db.selected(db);
      },
      toggleRating: (v: number) => toggleMany(data.rating.selected, v),
      toggleSpeed: (v: string) => toggleMany(data.speed.selected, v),
      fullHouse() {
        return data.db.selected() === 'masters' || (
          data.rating.selected().length === data.rating.available.length &&
          data.speed.selected().length === data.speed.available.length
        );
      },
      serialize
    };
  },

  view(ctrl: Controller) {
    const d = ctrl.data;
    return [
      h('section.db', [
        h('label', 'Database'),
        h('div.form-multipleChoice', d.db.available.map(s => {
          return h('span', {
            className: d.db.selected() === s ? 'selected' : '',
            oncreate: helper.ontapY(() => ctrl.toggleDb(s))
          }, s);
        }))
      ]),
      d.db.selected() === 'masters' ? h('div.masters.message', [
        h('i[data-icon=C]'),
        h('p', 'Two million OTB games'),
        h('p', 'of 2200+ FIDE rated players'),
        h('p', 'from 1952 to 2016')
      ]) : h('div', [
        h('section.rating', [
          h('label', 'Players Average rating'),
          h('div.form-multipleChoice',
            d.rating.available.map(r => {
              return h('span', {
                className: d.rating.selected().indexOf(r) > -1 ? 'selected' : '',
                oncreate: helper.ontapY(() => ctrl.toggleRating(r))
              }, r);
            })
          )
        ]),
        h('section.speed', [
          h('label', 'Game speed'),
          h('div.form-multipleChoice',
            d.speed.available.map(s => {
              return h('span', {
                className: d.speed.selected().indexOf(s) > -1 ? 'selected' : '',
                oncreate: helper.ontapY(() => ctrl.toggleSpeed(s))
              }, s);
            })
          )
        ])
      ]),
      h('section.save',
        h('button.button.text[data-icon=E]', {
          oncreate: helper.ontapY(ctrl.toggleOpen)
        }, 'All set!')
      )
    ];
  }
};
