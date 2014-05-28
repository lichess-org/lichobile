var shell = require('shelljs'),
    path  = require('path'),
    fs    = require('fs'),
    common;

module.exports = common = {
    // helper for resolving source paths from plugin.xml
    resolveSrcPath:function(plugin_dir, relative_path) {
        var full_path = path.resolve(plugin_dir, relative_path);
        return full_path;
    },
    // helper for resolving target paths from plugin.xml into a cordova project
    resolveTargetPath:function(project_dir, relative_path) {
        var full_path = path.resolve(project_dir, relative_path);
        return full_path;
    },
    // Many times we simply need to copy shit over, knowing if a source path doesnt exist or if a target path already exists
    copyFile:function(plugin_dir, src, project_dir, dest) {
        src = module.exports.resolveSrcPath(plugin_dir, src);
        if (!fs.existsSync(src)) throw new Error('"' + src + '" not found!');
        dest = module.exports.resolveTargetPath(project_dir, dest);
        shell.mkdir('-p', path.dirname(dest));

        // XXX shelljs decides to create a directory when -R|-r is used which sucks. http://goo.gl/nbsjq
        if(fs.statSync(src).isDirectory()) {
            shell.cp('-Rf', src+'/*', dest);
        } else {
            shell.cp('-f', src, dest);
        }
    },
    // Same as copy file but throws error if target exists
    copyNewFile:function(plugin_dir, src, project_dir, dest) {
        var target_path = common.resolveTargetPath(project_dir, dest);
        if (fs.existsSync(target_path))
            throw new Error('"' + target_path + '" already exists!');

        common.copyFile(plugin_dir, src, project_dir, dest);
    },
    // checks if file exists and then deletes. Error if doesn't exist
    removeFile:function(project_dir, src) {
        var file = module.exports.resolveSrcPath(project_dir, src);
        shell.rm('-Rf', file);
    },
    // deletes file/directory without checking
    removeFileF:function(file) {
        shell.rm('-Rf', file);
    },
    // Sometimes we want to remove some java, and prune any unnecessary empty directories
    deleteJava:function(project_dir, destFile) {
        var file = path.resolve(project_dir, destFile);
        if (!fs.existsSync(file)) return;

        common.removeFileF(file);

        // check if directory is empty
        var curDir = path.dirname(file);

        while(curDir !== path.resolve(project_dir, 'src')) {
            if(fs.existsSync(curDir) && fs.readdirSync(curDir) == 0) {
                fs.rmdirSync(curDir);
                curDir = path.resolve(curDir, '..');
            } else {
                // directory not empty...do nothing
                break;
            }
        }
    },
    // handle <asset> elements
    asset:{
        install:function(asset_el, plugin_dir, www_dir) {
            var src = asset_el.attrib.src;
            var target = asset_el.attrib.target;

            if (!src) {
                throw new Error('<asset> tag without required "src" attribute');
            }
            if (!target) {
                throw new Error('<asset> tag without required "target" attribute');
            }

            common.copyFile(plugin_dir, src, www_dir, target);
        },
        uninstall:function(asset_el, www_dir, plugin_id) {
            var target = asset_el.attrib.target || asset_el.attrib.src;

            if (!target) {
                throw new Error('<asset> tag without required "target" attribute');
            }

            common.removeFile(www_dir, target);
            common.removeFileF(path.resolve(www_dir, 'plugins', plugin_id));
        }
    }
};
