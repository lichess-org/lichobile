var xml_helpers = require('../../util/xml-helpers'),
    et = require('elementtree'),
    fs = require('fs'),
    path = require('path');

function csproj(location) {
    this.location = location;
    this.xml = xml_helpers.parseElementtreeSync(location);
    return this;
}

csproj.prototype = {
    write:function() {
        fs.writeFileSync(this.location, this.xml.write({indent:4}), 'utf-8');
    },

    addReference:function(relPath) {
        var item = new et.Element('ItemGroup');
        var extName = path.extname(relPath);

        var elem = new et.Element('Reference');
        // add dll file name
        elem.attrib.Include = path.basename(relPath, extName);
        // add hint path with full path
        var hint_path = new et.Element('HintPath');
        hint_path.text = relPath;
        elem.append(hint_path);

        if(extName == ".winmd") {
            var mdFileTag = new et.Element("IsWinMDFile");
                mdFileTag.text = "true";
            elem.append(mdFileTag);
        }

        item.append(elem);

        this.xml.getroot().append(item);
    },

    removeReference:function(relPath) {
        var item = new et.Element('ItemGroup');
        var extName = path.extname(relPath);
        var includeText = path.basename(relPath,extName);
        // <ItemGroup>
        //   <Reference Include="WindowsRuntimeComponent1">
        var item_groups = this.xml.findall('ItemGroup/Reference[@Include="' + includeText + '"]/..');

        if(item_groups.length > 0 ) {
            this.xml.getroot().remove(0, item_groups[0]);
        }
    },

    addSourceFile:function(relative_path) {
        relative_path = relative_path.split('/').join('\\');
        // make ItemGroup to hold file.
        var item = new et.Element('ItemGroup');

        var extName = path.extname(relative_path);
        // check if it's a .xaml page
        if(extName == ".xaml") {
            var page = new et.Element('Page');
            var sub_type = new et.Element('SubType');

            sub_type.text = "Designer";
            page.append(sub_type);
            page.attrib.Include = relative_path;

            var gen = new et.Element('Generator');
            gen.text = "MSBuild:Compile";
            page.append(gen);

            var item_groups = this.xml.findall('ItemGroup');
            if(item_groups.length == 0) {
                item.append(page);
            } else {
                item_groups[0].append(page);
            }
        }
        else if (extName == ".cs") {
            var compile = new et.Element('Compile');
            compile.attrib.Include = relative_path;
            // check if it's a .xaml.cs page that would depend on a .xaml of the same name
            if (relative_path.indexOf('.xaml.cs', relative_path.length - 8) > -1) {
                var dep = new et.Element('DependentUpon');
                var parts = relative_path.split('\\');
                var xaml_file = parts[parts.length - 1].substr(0, parts[parts.length - 1].length - 3); // Benn, really !?
                dep.text = xaml_file;
                compile.append(dep);
            }
            item.append(compile);
        }
        else { // otherwise add it normally
            var compile = new et.Element('Content');
            compile.attrib.Include = relative_path;
            item.append(compile);
        }
        this.xml.getroot().append(item);
    },

    removeSourceFile:function(relative_path) {
        relative_path = relative_path.split('/').join('\\');
        var item_groups = this.xml.findall('ItemGroup');
        for (var i = 0, l = item_groups.length; i < l; i++) {
            var group = item_groups[i];
            var files = group.findall('Compile').concat(group.findall('Page')).concat(group.findall('Content'));
            for (var j = 0, k = files.length; j < k; j++) {
                var file = files[j];
                if (file.attrib.Include == relative_path) {
                    // remove file reference
                    group.remove(0, file);
                    // remove ItemGroup if empty
                    var new_group = group.findall('Compile').concat(group.findall('Page')).concat(group.findall('Content'));
                    if(new_group.length < 1) {
                        this.xml.getroot().remove(0, group);
                    }
                    return true;
                }
            }
        }
        return false;
    }
};

module.exports = csproj;
