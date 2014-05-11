module.exports = function(grunt) {
  var browsers = [
    {
        browserName: "internet explorer",
        platform: "Windows XP",
        version: "8"
    },{
        browserName: "internet explorer",
        platform: "Windows 7",
        version: "9"
    },{
        browserName: "internet explorer",
        platform: "Windows 8",
        version: "10"
    },{
        browserName: "internet explorer",
        platform: "Windows 8.1",
        version: "11"
    },{
        browserName: "opera",
        platform: "Windows 7",
        version: "12"
    },{
        browserName: "googlechrome",
        platform: "OS X 10.6"
    },{
        browserName: "googlechrome",
        platform: "linux"
    },{
        browserName: "chrome",
        platform: "Windows 7"
    },{
        browserName: "googlechrome",
        platform: "Windows XP"
    },{
    /*
        browserName: "firefox",
        platform: "Windows 7",
        version: "25"
    },{
        browserName: "firefox",
        platform: "Windows 7",
        version: "24"
    },{
    */
        browserName: "firefox",
        platform: "Windows 8",
        version: "22"
    },{
        browserName: "firefox",
        platform: "Windows 8",
        version: "20"
    },{
        browserName: "firefox",
        platform: "Windows 8",
        version: "16"
    },{
        browserName: "firefox",
        platform: "Windows 8",
        version: "10"
    },{
        browserName:"iphone",
        platform: "OS X 10.8",
        version: "6.1"
    },{
        browserName:"iphone",
        platform: "OS X 10.8",
        version: "6"
    },{
        browserName:"iphone",
        platform: "OS X 10.8",
        version: "5.1"
    },{
        browserName:"iphone",
        platform: "OS X 10.6",
        version: "5.0"
    },{
        browserName:"safari",
        platform: "OS X 10.8",
        version: "6"
    },{
        browserName:"safari",
        platform: "OS X 10.6",
        version: "5"
    },{
        browserName:"android",
        platform: "Linux",
        version: "4.0"
    }];

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= pkg.version %> - <%= pkg.description %> */\n'
      },
      build: {
        src: 'src/<%= pkg.name %>.js',
        dest: 'build/<%= pkg.name %>.min.js'
      }
    },
    jshint: {
      all: {
        src: ['src/<%= pkg.name %>.js']
      }
    },
    docco: {
      all: {
        src: ['src/*.js'],
        dest: 'docs/'
      }
    },
    watch: {
      all: {
        files: ['src/*.js'],
        tasks: ['compile']
      }
    },
    'saucelabs-qunit': {
      all: {
        options: {
          urls: ["http://127.0.0.1:9999/test/index.html"],
          tunnelTimeout: 5,
          build: (new Date()).getTime(),
          concurrency: 1,
          browsers: browsers,
          testname: "Qajax tests",
          testReadyTimeout: 30000,
          tags: ["master"]
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-docco2');
  grunt.loadNpmTasks('grunt-saucelabs');

  grunt.registerTask('mock-server', 'Start a mock server to test Qajax.', function() {

    function delay (callback, timeout) {
      setTimeout(callback, timeout);
    }

    var connect = require('connect'), URL = require('url');
    grunt.log.writeln('Starting server...');
    connect().use(function (req, res, next) {
      var url = URL.parse(req.url, true);
      var closed = false;
      req.once('close', function(){
        closed = true;
      });
      var handle = (function () {
        var status = ("status" in url.query) ? parseInt(url.query.status, 10) : 200;
        if (url.pathname == "/ECHO_HEADERS") {
          return function () {
            if (closed) return;
            res.write(JSON.stringify(req.headers));
            req.pipe(res);
          };
        }
        if (url.pathname == "/ECHO") {
          return function () {
            if (closed) return;
            res.writeHead(status);
            req.pipe(res);
          };
        }
        if (url.pathname.indexOf("/test/dataset/")===0) {
          req.method = "GET"; // next layer will behave like a GET so return the dataset content as a result.
          return function () {
            if (closed) return;
            if (status != 200) {
              res.statusCode = status; // next layer will have this default statusCode for the response.
            }
            return next();
          };
        }
        return next;
      }());
      if ("latency" in url.query)
        delay(handle, parseInt(url.query.latency, 10));
      else
        handle();
    })
    .use(connect.static(__dirname))
    .listen(9999);
  });

  grunt.registerTask('default', ['compile', 'mock-server', 'watch']);
  grunt.registerTask('compile', ['jshint', 'uglify', 'docco']);
  grunt.registerTask('test-sauce', ['mock-server', 'saucelabs-qunit']);

};
