import m from 'mithril';
import helper from '../../helper';
import backbutton from '../../../backbutton';
import settings from '../../../settings';

export default {
  controller(variant, onClose) {
    const available = ['lichess'];
    if (variant.key === 'standard' || variant.key === 'fromPosition') {
      available.push('masters');
    }

    const open = m.prop(false);

    function doOpen() {
      backbutton.stack.push(doClose);
      open(true);
    }

    function doClose(fromBB) {
      if (fromBB !== 'backbutton' && open()) backbutton.stack.pop();
      open(false);
      onClose();
    }

    const data = {
      open,
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

    function toggleMany(c, value) {
      if (c().indexOf(value) === -1) c(c().concat([value]));
      else if (c().length > 1) c(c().filter(function(v) {
        return v !== value;
      }));
    }

    return {
      data: data,
      toggleOpen: function() {
        if (open()) doClose();
        else doOpen();
      },
      toggleDb: function(db) {
        data.db.selected(db);
      },
      toggleRating: toggleMany.bind(undefined, data.rating.selected),
      toggleSpeed: toggleMany.bind(undefined, data.speed.selected),
      fullHouse: function() {
        return data.db.selected() === 'masters' || (
          data.rating.selected().length === data.rating.available.length &&
          data.speed.selected().length === data.speed.available.length
        );
      }
    };
  },

  view(ctrl) {
    const d = ctrl.data;
    return [
      m('section.db', [
        m('label', 'Database'),
        m('div.choices', d.db.available.map(s => {
          return m('span', {
            className: d.db.selected() === s ? 'selected' : '',
            config: helper.ontouchY(ctrl.toggleDb.bind(undefined, s))
          }, s);
        }))
      ]),
      d.db.selected() === 'masters' ? m('div.masters.message', [
        m('i[data-icon=C]'),
        m('p', 'Two million OTB games'),
        m('p', 'of 2200+ FIDE rated players'),
        m('p', 'from 1952 to 2016')
      ]) : m('div', [
        m('section.rating', [
          m('label', 'Players Average rating'),
          m('div.choices',
            d.rating.available.map(r => {
              return m('span', {
                className: d.rating.selected().indexOf(r) > -1 ? 'selected' : '',
                config: helper.ontouchY(ctrl.toggleRating.bind(undefined, r))
              }, r);
            })
          )
        ]),
        m('section.speed', [
          m('label', 'Game speed'),
          m('div.choices',
            d.speed.available.map(s => {
              return m('span', {
                className: d.speed.selected().indexOf(s) > -1 ? 'selected' : '',
                config: helper.ontouchY(ctrl.toggleSpeed.bind(undefined, s))
              }, s);
            })
          )
        ])
      ]),
      m('section.save',
        m('button.button.text[data-icon=E]', {
          config: helper.ontouchY(ctrl.toggleOpen)
        }, 'All set!')
      )
    ];
  }
};
