var npm = require('npm'),
    path = require('path'),
    http = require('http'),
    url = require('url'),
    fs = require('fs'),
    manifest = require('./manifest'),
    os = require('os'),
    rc = require('rc'),
    Q = require('q'),
    request = require('request'),
    zlib = require('zlib'),
    tar = require('tar'),
    shell = require('shelljs'),
    home = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE,
    plugmanConfigDir = path.resolve(home, '.plugman'),
    plugmanCacheDir = path.resolve(plugmanConfigDir, 'cache');

/**
 * @method getPackageInfo
 * @param {String} args Package names
 * @return {Promise.<Object>} Promised package info.
 */
function getPackageInfo(args) {
    var thing = args.length ? args.shift().split("@") : [],
        name = thing.shift(),
        version = thing.join("@") || 'latest';
    var settings = module.exports.settings;

    var d = Q.defer();
    var req = makeRequest('GET', settings.registry + '/' + name + '/' + version, function(err, res, body){
        if(err || res.statusCode != 200) {
          d.reject(new Error('Failed to fetch package information for '+name));
        } else {
          d.resolve(JSON.parse(body));
        }
    });
    req.on('error', function(err) {
        d.reject(err);
    });
    return d.promise;
}

/**
 * @method fetchPackage
 * @param {String} info Package info
 * @return {Promise.<string>} Promised path to the package.
 */
function fetchPackage(info, cl) {
    var settings = module.exports.settings;
    var d = Q.defer();
    var cached = path.resolve(settings.cache, info.name, info.version, 'package');
    if(fs.existsSync(cached)) {
        d.resolve(cached);
    } else {
        var download_dir = path.resolve(cached, '..');
        shell.mkdir('-p', download_dir);

        var req = makeRequest('GET', info.dist.tarball, function (err, res, body) {
            if(err || res.statusCode != 200) {
                d.reject(new Error('failed to fetch the plugin archive'));
            } else {
                // Update the download count for this plugin.
                // Fingers crossed that the timestamps are unique, and that no plugin is downloaded
                // twice in a single millisecond.
                //
                // This is acceptable, because the failure mode is Couch gracefully rejecting the second one
                // (for lacking a _rev), and dropped a download count is not important.
                var now = new Date();
                var pkgId = info._id.substring(0, info._id.indexOf('@'));
                var message = {
                    day: now.getUTCFullYear() + '-' + (now.getUTCMonth()+1) + '-' + now.getUTCDate(),
                    pkg: pkgId,
                    client: cl
                };
                var remote = settings.registry + '/downloads'

                makeRequest('POST', remote, message, function (err, res, body) {
                    // ignore errors
                });
            }
        });
        req.pipe(zlib.createUnzip())
        .pipe(tar.Extract({path:download_dir}))
        .on('error', function(err) {
            shell.rm('-rf', download_dir);
            d.reject(err);
        })
        .on('end', function() {
            d.resolve(path.resolve(download_dir, 'package'));
        });
    }
    return d.promise;
}

module.exports = {
    settings: null,
    /**
     * @method config
     * @param {Array} args Command argument
     * @return {Promise.<Object>} Promised configuration object.
     */
    config: function(args) {
        return initSettings().then(function(settings) {
            return Q.ninvoke(npm, 'load', settings)
        })
        .then(function() {
            return Q.ninvoke(npm.commands, 'config', args);
        });
    },

    /**
     * @method owner
     * @param {Array} args Command argument
     * @return {Promise.<void>} Promise for completion.
     */
    owner: function(args) {
        return initSettings().then(function(settings) {
            return Q.ninvoke(npm, 'load', settings);
        }).then(function() {
            return Q.ninvoke(npm.commands, 'owner', args);
        });
    },
    /**
     * @method adduser
     * @param {Array} args Command argument
     * @return {Promise.<void>} Promise for completion.
     */
    adduser: function(args) {
        return initSettings().then(function(settings) {
            return Q.ninvoke(npm, 'load', settings)
        })
        .then(function() {
            return Q.ninvoke(npm.commands, 'adduser', args);
        });
    },

    /**
     * @method publish
     * @param {Array} args Command argument
     * @return {Promise.<Object>} Promised published data.
     */
    publish: function(args) {
        return initSettings()
        .then(function(settings) {
            return manifest.generatePackageJsonFromPluginXml(args[0])
            .then(function() {
                return Q.ninvoke(npm, 'load', settings);
            }).then(function() {
                return Q.ninvoke(npm.commands, 'publish', args)
            }).fin(function() {
                fs.unlink(path.resolve(args[0], 'package.json'));
            });
        });
    },

    /**
     * @method search
     * @param {Array} args Array of keywords
     * @return {Promise.<Object>} Promised search results.
     */
    search: function(args) {
        return initSettings()
        .then(function(settings) {
            return Q.ninvoke(npm, 'load', settings);
        }).then(function() {
            return Q.ninvoke(npm.commands, 'search', args, true);
        });
    },

    /**
     * @method unpublish
     * @param {Array} args Command argument
     * @return {Promise.<Object>} Promised results.
     */
    unpublish: function(args) {
        return initSettings()
        .then(function(settings) {
            return Q.ninvoke(npm, 'load', settings);
        }).then(function() {
            return Q.ninvoke(npm.commands, 'unpublish', args);
        }).then(function() {
            return Q.ninvoke(npm.commands, 'cache', ["clean"]);
        });
    },

    /**
     * @method fetch
     * @param {String} name Plugin name
     * @return {Promise.<string>} Promised path to fetched package.
     */
    fetch: function(args, client) {
        var cl = (client === 'plugman' ? 'plugman' : 'cordova-cli');
        return initSettings()
        .then(function(settings) {
            return getPackageInfo(args);
        }).then(function(info) {
            return fetchPackage(info, cl);
        });
    },

    /**
     * @method info
     * @param {String} name Plugin name
     * @return {Promise.<Object>} Promised package info.
     */
    info: function(args) {
        return initSettings()
        .then(function() {
            return getPackageInfo(args);
        });
    }
}

/**
 * @method initSettings
 * @return {Promise.<Object>} Promised settings.
 */
function initSettings() {
    var settings = module.exports.settings;
    // check if settings already set
    if(settings != null) return Q(settings);

    // setting up settings
    // obviously if settings dir does not exist settings is going to be empty
    if(!fs.existsSync(plugmanConfigDir)) {
        fs.mkdirSync(plugmanConfigDir);
        fs.mkdirSync(plugmanCacheDir);
    }

    settings =
    module.exports.settings =
    rc('plugman', {
         cache: plugmanCacheDir,
         force: true,
         registry: 'http://registry.cordova.io',
         logstream: fs.createWriteStream(path.resolve(plugmanConfigDir, 'plugman.log')),
         userconfig: path.resolve(plugmanConfigDir, 'config')
    });
    return Q(settings);
}


function makeRequest (method, where, what, cb_) {
  var settings = module.exports.settings
  var remote = url.parse(where)
  if (typeof cb_ !== "function") cb_ = what, what = null
  var cbCalled = false
  function cb () {
    if (cbCalled) return
    cbCalled = true
    cb_.apply(null, arguments)
  }

  var strict = settings['strict-ssl']
  if (strict === undefined) strict = true
  var opts = { url: remote
             , method: method
             , ca: settings.ca
             , strictSSL: strict }
    , headers = opts.headers = {}

  headers.accept = "application/json"

  headers["user-agent"] = settings['user-agent'] ||
                          'node/' + process.version

  var p = settings.proxy
  var sp = settings['https-proxy'] || p
  opts.proxy = remote.protocol === "https:" ? sp : p

  // figure out wth 'what' is
  if (what) {
    if (Buffer.isBuffer(what) || typeof what === "string") {
      opts.body = what
      headers["content-type"] = "application/json"
      headers["content-length"] = Buffer.byteLength(what)
    } else {
      opts.json = what
    }
  }

  var req = request(opts, cb)

  req.on("error", cb)
  req.on("socket", function (s) {
    s.on("error", cb)
  })

  return req
}
