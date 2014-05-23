var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;

var browserResolve = require('browser-resolve');
var nodeResolve = require('resolve');
var detective = require('detective');
var through = require('through2');
var concat = require('concat-stream');
var parents = require('parents');
var combine = require('stream-combiner');
var duplexer = require('duplexer2');

var inherits = require('inherits');
var Readable = require('readable-stream').Readable;

module.exports = Deps;
inherits(Deps, Readable);

function Deps (mains, opts) {
    var self = this;
    if (!(this instanceof Deps)) return new Deps(mains, opts);
    Readable.call(this, { objectMode: true });
    
    if (!opts) opts = {};
    if (!Array.isArray(mains)) mains = [ mains ].filter(Boolean);
    
    this.basedir = opts.basedir || process.cwd();
    this.cache = opts.cache;
    this.pkgCache = opts.packageCache || {};
    this.pkgFileCache = {};
    this.pkgFileCachePending = {};
    this.visited = {};
    this.walking = {};
    
    this.paths = opts.paths || process.env.NODE_PATH;
    if (typeof this.paths === 'string') {
        this.paths = process.env.NODE_PATH.split(':');
    }
    if (!this.paths) this.paths = [];
    
    this.entries = [];
    this.mains = [];
    
    this.transforms = [].concat(opts.transform).filter(Boolean);
    this.resolver = opts.resolve || browserResolve;
    this.options = opts;
    this.pending = 0;
    this.top = { id: '/', filename: '/', paths: this.paths };
    
    mains.forEach(function (file) { self.add(file) });
}

Deps.prototype._read = function () {
    if (this._started) return;
    this._started = true;
    this._start();
};

Deps.prototype._start = function () {
    var self = this;
    
    if (this.entries.length === 0) {
        return this.push(null);
    }
    
    for (var i = 0; i < this.entries.length; i++) (function (i) {
        var main = self.mains[i];
        var file = self.entries[i];
        
        self.lookupPackage(file, function (err, pkg) {
            if (err) return self.emit('error', err)
            else start(main, file, pkg)
        });
    })(i);
    
    function start (main, file, pkg) {
        if (!pkg) pkg = {};
        if (!pkg.__dirname) pkg.__dirname = path.dirname(file);
        
        if (typeof main === 'object') {
            self.walk({ stream: main, file: main.path || file }, main);
        }
        else self.walk(main, self.top);
    }
};

Deps.prototype.add = function (main) {
    var self = this;
    
    var file;
    if (typeof main.pipe === 'function') {
        var n = Math.floor(Math.pow(16,8) * Math.random()).toString(16);
        file = path.join(this.basedir, 'fake_' + n + '.js');
        if (typeof main.read !== 'function') {
            var old = main;
            main = Readable().wrap(main);
            if (old.path) main.path = old.path;
        }
    }
    else file = main;
    file = path.resolve(file);
    this.mains.push(main);
    this.entries.push(file);
};

Deps.prototype.resolve = function (id, parent, cb) {
    var self = this;
    var opts = self.options;
    
    if (xhas(self.cache, parent.id, 'deps', id)
    && self.cache[parent.id].deps) {
        var file = self.cache[parent.id].deps[id];
        var pkg = self.pkgCache[file];
        if (pkg) return cb(null, file, pkg);
        return self.lookupPackage(file, function (err, pkg) {
            cb(null, file, pkg);
        });
    }
    
    var pkgdir;
    parent.packageFilter = function (p, x) {
        pkgdir = x;
        if (opts.packageFilter) return opts.packageFilter(p, x);
        else return p;
    };
    
    if (opts.extensions) parent.extensions = opts.extensions;
    if (opts.modules) parent.modules = opts.modules;
    
    self.resolver(id, parent, function onresolve (err, file, pkg) {
        if (err) return cb(err);
        if (!file) return cb(new Error(
            'module not found: "' + id + '" from file '
            + parent.filename
        ));
        
        if (pkg && pkgdir) pkg.__dirname = pkgdir;
        if (!pkg || !pkg.__dirname) {
            self.lookupPackage(file, function (err, p) {
                if (err) return cb(err);
                if (!p) p = {};
                if (!p.__dirname) p.__dirname = path.dirname(file);
                self.pkgCache[file] = p;
                onresolve(err, file, opts.packageFilter
                    ? opts.packageFilter(p, p.__dirname) : p
                );
            });
        }
        else cb(err, file, pkg);
    });
};

Deps.prototype.readFile = function (file, pkg) {
    if (this.cache && this.cache[file]) {
        var tr = through();
        tr.push(this.cache[file].source);
        tr.push(null);
        return tr;
    }
    var rs = fs.createReadStream(file);
    rs.on('error', function (err) { tr.emit('error', err) });
    this.emit('file', file);
    return rs.pipe(this.getTransforms(file, pkg));
};

Deps.prototype.getTransforms = function (file, pkg) {
    var self = this;
    var isTopLevel = this.entries.some(function (main) {
        var m = path.relative(path.dirname(main), file);
        return m.split('/').indexOf('node_modules') < 0;
    });
    
    var transforms = [].concat(isTopLevel ? this.transforms : [])
        .concat(getTransforms(pkg, this.options))
    ;
    if (transforms.length === 0) return through();
    
    var pending = transforms.length;
    var streams = [];
    var input = through();
    var output = through();
    var dup = duplexer(input, output);
    
    for (var i = 0; i < transforms.length; i++) (function (i) {
        makeTransform(transforms[i], function (err, trs) {
            if (err) return self.emit('error', err)
            streams[i] = trs;
            if (-- pending === 0) done();
        });
    })(i);
    return dup;
    
    function done () {
        var middle = combine.apply(null, streams);
        middle.on('error', function (err) {
            self.emit('error', err);
        });
        input.pipe(middle).pipe(output);
    }
    
    function makeTransform (tr, cb) {
        var trOpts = {};
        if (Array.isArray(tr)) {
            trOpts = tr[1];
            tr = tr[0];
        }
        if (typeof tr === 'function') {
            var t = tr(file, trOpts);
            self.emit('transform', t, file);
            nextTick(cb, null, t);
        }
        else {
            loadTransform(tr, trOpts, function (err, trs) {
                if (err) return cb(err);
                cb(null, trs);
            });
        }
    }
    
    function loadTransform (id, trOpts, cb) {
        var params = { basedir: path.dirname(file) };
        nodeResolve(id, params, function nr (err, res, again) {
            if (err && again) return cb(err);
            
            if (err) {
                params.basedir = pkg.__dirname;
                return nodeResolve(id, params, function (e, r) {
                    nr(e, r, true)
                });
            }
            
            if (!res) return cb(new Error(
                'cannot find transform module ' + tr
                + ' while transforming ' + file
            ));
            
            var r = require(res);
            if (typeof r !== 'function') {
                return cb(new Error('transform not a function'));
            }
            
            var trs = r(file, trOpts);
            self.emit('transform', trs, file);
            cb(null, trs);
        });
    }
};

Deps.prototype.walk = function (id, parent, cb) {
    var self = this;
    var opts = self.options;
    this.pending ++;
    
    if (id && typeof id === 'object' && id.stream) {
        self.lookupPackage(id.file, function (err, pkg) {
            id.stream
                .pipe(self.getTransforms(id.file, pkg))
                .pipe(concat(function (body) {
                    var src = body.toString('utf8');
                    var deps = self.parseDeps(id.file, src);
                    if (deps) fromDeps(id.file, src, pkg || {}, deps);
                }))
            ;
        });
        return;
    }
    
    self.resolve(id, parent, function (err, file, pkg) {
        if (err) return self.emit('error', err);
        if (self.visited[file]) {
            if (-- self.pending === 0) self.push(null);
            return cb && cb(null, file);
        }
        self.visited[file] = true;
        
        var c = self.cache && self.cache[file];
        if (c) return fromDeps(file, c.source, c.package, Object.keys(c.deps));
        
        self.readFile(file, pkg).pipe(concat(function (body) {
            var src = body.toString('utf8');
            var deps = self.parseDeps(file, src);
            if (deps) fromDeps(file, src, pkg, deps);
        }));
    });
    
    function fromDeps (file, src, pkg, deps) {
        var p = deps.length;
        var current = {
            id: file,
            filename: file,
            paths: self.paths,
            package: pkg
        };
        var resolved = {};
        
        deps.forEach(function (id) {
            if (opts.filter && !opts.filter(id)) {
                resolved[id] = false;
                if (--p === 0) done();
                return;
            }
            self.walk(id, current, function (err, r) {
                resolved[id] = r;
                if (--p === 0) done();
            });
        });
        if (deps.length === 0) done();
        
        function done () {
            var rec = {
                id: file,
                source: src,
                deps: resolved
            };
            if (self.entries.indexOf(file) >= 0) {
                rec.entry = true;
            }
            self.push(rec);
            
            if (cb) cb(null, file);
            if (-- self.pending === 0) self.push(null);
        }
    }
};

Deps.prototype.parseDeps = function (file, src, cb) {
    if (this.options.noParse === true) return [];
    if (/\.json$/.test(file)) return [];
    
    if (Array.isArray(this.options.noParse)
    && this.options.noParse.indexOf(file) >= 0) {
        return [];
    }
    
    try { var deps = detective(src) }
    catch (ex) {
        var message = ex && ex.message ? ex.message : ex;
        this.emit('error', new Error(
            'Parsing file ' + file + ': ' + message
        ));
        return;
    }
    return deps;
};

Deps.prototype.lookupPackage = function (file, cb) {
    var self = this;
    
    var cached = this.pkgCache[file];
    if (cached) return nextTick(cb, null, cached);
    if (cached === false) return nextTick(cb, null, undefined);
    
    var dirs = parents(path.dirname(file));
    
    (function next () {
        if (dirs.length === 0) {
            self.pkgCache[file] = false;
            return cb(null, undefined);
        }
        var dir = dirs.shift();
        if (dir.split('/').slice(-1)[0] === 'node_modules') {
            return cb(null, undefined);
        }
        
        var pkgfile = path.join(dir, 'package.json');
        
        var cached = self.pkgCache[pkgfile];
        if (cached) return nextTick(cb, null, cached);
        else if (cached === false) return next();
        
        var pcached = self.pkgFileCachePending[pkgfile];
        if (pcached) return pcached.push(onpkg);
        pcached = self.pkgFileCachePending[pkgfile] = [];
        
        fs.readFile(pkgfile, function (err, src) {
            if (err) return onpkg();
            try { var pkg = JSON.parse(src) }
            catch (err) {
                return onpkg(new Error([
                    err + ' while parsing json file ' + pkgfile
                ].join('')))
            }
            pkg.__dirname = dir;
            
            self.pkgCache[pkgfile] = pkg;
            self.pkgCache[file] = pkg;
            onpkg(null, pkg);
        });
        
        function onpkg (err, pkg) {
            if (self.pkgFileCachePending[pkgfile]) {
                var fns = self.pkgFileCachePending[pkgfile];
                delete self.pkgFileCachePending[pkgfile];
                fns.forEach(function (f) { f(err, pkg) });
            }
            if (err) cb(err)
            else if (pkg) cb(null, pkg)
            else {
                self.pkgCache[pkgfile] = false;
                self.pkgCache[file] = false;
                next();
            }
        }
    })();
};
 
function getTransforms (pkg, opts) {
    var trx = [];
    if (opts.transformKey) {
        var n = pkg;
        var keys = opts.transformKey;
        for (var i = 0; i < keys.length; i++) {
            if (n && typeof n === 'object') n = n[keys[i]];
            else break;
        }
        if (i === keys.length) {
            trx = [].concat(n).filter(Boolean);
        }
    }
    return trx.concat(opts.globalTransform || []);
}

function nextTick (cb) {
    var args = [].slice.call(arguments, 1);
    process.nextTick(function () { cb.apply(null, args) });
}

function xhas (obj) {
    if (!obj) return false;
    for (var i = 1; i < arguments.length; i++) {
        var key = arguments[i];
        if (!has(obj, key)) return false;
        obj = obj[key];
    }
    return true;
}

function has (obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
}
