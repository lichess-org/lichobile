
var menu = {};

menu.controller = function() {
  this.isOpen = false;

  this.toggle = function() {
    this.isOpen = !this.isOpen;
    m.redraw();
  }.bind(this);
};

menu.view = function(ctrl) {
  return [
    m('header', [m('nav', [m('h2', 'Settings')])]),
    m('div', [
      m('form', [
        m('h3', 'Connection'),
        m('input#pseudo[type=text][placeholder=Pseudo'),
          m('input#password[type=password][placeholder=Password]'),
          m('button#login', 'LOG IN')
      ])
    ])
  ];
};

module.exports = menu;
