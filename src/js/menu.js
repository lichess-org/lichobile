
var menu = {};

menu.isOpen = false;

menu.toggle = function() {
  menu.isOpen = !menu.isOpen;
};

menu.view = function() {
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
