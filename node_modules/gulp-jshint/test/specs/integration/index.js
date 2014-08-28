module.exports = function () {
  describe('integration', function () {
    require('../../util').requireDir(__dirname).forEach(function (loadTests) {
      loadTests();
    });
  });
};