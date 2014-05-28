var xml_helpers = require('../../util/xml-helpers'),
    path = require('path'),
    Q = require('q'),
    fs = require('fs'),
    whitelist = require('./whitelist');

function validateName(name) {
    if (!name.match(/^(\w+\.){2,}.*$/)) {
        throw new Error('Invalid plugin ID. It has to follow the reverse domain `com.domain.plugin` format');
    }

    if (name.match(/org.apache.cordova\..*/) && whitelist.indexOf(name) === -1) {
        throw new Error('Invalid Plugin ID. The "org.apache.cordova" prefix is reserved for plugins provided directly by the Cordova project.');
    }

    return true;
}

// Java world big-up!
// Returns a promise.
function generatePackageJsonFromPluginXml(plugin_path) {
    return Q().then(function() {
        var package_json = {};
        var pluginXml = xml_helpers.parseElementtreeSync(path.join(plugin_path, 'plugin.xml'));

        if(!pluginXml) throw new Error('invalid plugin.xml document');

        var pluginElm = pluginXml.getroot();

        if(!pluginElm) throw new Error('invalid plugin.xml document');

        // REQUIRED: name, version
        // OPTIONAL: description, license, keywords, engine
        var name = pluginElm.attrib.id,
            version = pluginElm.attrib.version,
            cordova_name = pluginElm.findtext('name'),
            description = pluginElm.findtext('description'),
            license = pluginElm.findtext('license'),
            keywords = pluginElm.findtext('keywords'),
            repo = pluginElm.findtext('repo'),
            issue = pluginElm.findtext('issue'),
            engines = pluginElm.findall('engines/engine'),
            platformsElm = pluginElm.findall('platform'),
            englishdoc = "",
            platforms = [];

        platformsElm.forEach(function(plat){
            platforms.push(plat.attrib.name);
        })
        if(!version) throw new Error('`version` required');

        package_json.version = version;

        if(!name) throw new Error('`id` is required');

        validateName(name);

        package_json.name = name.toLowerCase();

        if(cordova_name) package_json.cordova_name = cordova_name;
        if(description)  package_json.description  = description;
        if(license)      package_json.license      = license;
        if(repo)         package_json.repo         = repo;
        if(issue)        package_json.issue        = issue;
        if(keywords)     package_json.keywords     = keywords.split(',');
        if(platforms)    package_json.platforms    = platforms;

        // adding engines
        if(engines) {
            package_json.engines = [];
            for(var i = 0, j = engines.length ; i < j ; i++) {
                package_json.engines.push({name: engines[i].attrib.name, version: engines[i].attrib.version});
            }
        }

        //set docs_path to doc/index.md exists
        var docs_path = path.resolve(plugin_path, 'doc/index.md');
        if(!(fs.existsSync(docs_path))){
            //set docs_path to doc/en/index.md
            docs_path = path.resolve(plugin_path, 'doc/en/index.md');
        }
        if(fs.existsSync(docs_path)){
            englishdoc = fs.readFileSync(docs_path, 'utf-8');
            package_json.englishdoc = englishdoc;
        }

        // write package.json
        var package_json_path = path.resolve(plugin_path, 'package.json');
        //console.log('about to write package.json');
        fs.writeFileSync(package_json_path, JSON.stringify(package_json, null, 4), 'utf8');
        return package_json;
    });
}

module.exports.generatePackageJsonFromPluginXml = generatePackageJsonFromPluginXml;
