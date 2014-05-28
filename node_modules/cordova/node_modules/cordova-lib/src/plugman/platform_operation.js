var platform = require('./platform');

module.exports = function( args ) {
    return platform[ args.operation ]( args.platform_name );
};
