/**
    Licensed to the Apache Software Foundation (ASF) under one
    or more contributor license agreements.  See the NOTICE file
    distributed with this work for additional information
    regarding copyright ownership.  The ASF licenses this file
    to you under the Apache License, Version 2.0 (the
    "License"); you may not use this file except in compliance
    with the License.  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing,
    software distributed under the License is distributed on an
    "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, either express or implied.  See the License for the
    specific language governing permissions and limitations
    under the License.
*/
var path = require('path'),
    fs = require('fs'),
    ConfigParser = require('../src/cordova/ConfigParser'),
    xml = path.join(__dirname, 'test-config.xml'),
    xml_contents = fs.readFileSync(xml, 'utf-8');

describe('config.xml parser', function () {
    var readFile;
    beforeEach(function() {
        readFile = spyOn(fs, 'readFileSync').andReturn(xml_contents);
    });

    it('should create an instance based on an xml file', function() {
        var cfg;
        expect(function () {
            cfg = new ConfigParser(xml);
        }).not.toThrow();
        expect(cfg).toBeDefined();
        expect(cfg.doc).toBeDefined();
    });

    describe('methods', function() {
        var cfg;
        beforeEach(function() {
            cfg = new ConfigParser(xml);
        });

        describe('package name / id', function() {
            it('should get the (default) packagename', function() {
                expect(cfg.packageName()).toEqual('io.cordova.hellocordova');
            });
            it('should allow setting the packagename', function() {
                cfg.setPackageName('this.is.bat.country');
                expect(cfg.packageName()).toEqual('this.is.bat.country');
            });
        });

        describe('version', function() {
            it('should get the version', function() {
                expect(cfg.version()).toEqual('0.0.1');
            });
            it('should allow setting the version', function() {
                cfg.setVersion('2.0.1');
                expect(cfg.version()).toEqual('2.0.1');
            });
        });

        describe('app name', function() {
            it('should get the (default) app name', function() {
                expect(cfg.name()).toEqual('Hello Cordova');
            });
            it('should allow setting the app name', function() {
                cfg.setName('this.is.bat.country');
                expect(cfg.name()).toEqual('this.is.bat.country');
            });
        });
        describe('preference', function() {
            it('should get value of existing preference', function() {
                expect(cfg.getPreference('fullscreen')).toEqual('true');
            });
            it('should get undefined as non existing preference', function() {
                expect(cfg.getPreference('zimzooo!')).toEqual(undefined);
            });
        });
        describe('feature',function(){
            it('should allow adding a new feature', function(){
                cfg.addFeature('myfeature');
                var features = cfg.doc.findall('feature');
                expect(features[0].attrib.name).toEqual('myfeature');
            });
            it('should allow adding features with params', function(){
                cfg.addFeature('afeature', JSON.parse('[{"name":"paraname", "value":"paravalue"}]'));
                var features = cfg.doc.findall('feature');
                expect(features[0].attrib.name).toEqual('afeature');
                var params = features[0].findall('param');
                expect(params[0].attrib.name).toEqual('paraname');
                expect(params[0].attrib.value).toEqual('paravalue');
            });
        });
    });
});
