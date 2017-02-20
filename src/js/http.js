"use strict";
const merge = require("lodash/merge");
const spinner_1 = require("./spinner");
const querystring_1 = require("./utils/querystring");
exports.apiVersion = 2;
const baseUrl = window.lichess.apiEndPoint;
function checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
        return response;
    }
    else {
        const error = new Error(response.statusText);
        error.response = response;
        throw error;
    }
}
exports.checkStatus = checkStatus;
function addQuerystring(url, querystring) {
    const prefix = url.indexOf('?') < 0 ? '?' : '&';
    let res = url + prefix + querystring;
    return res;
}
function request(url, opts, feedback = false) {
    let timeoutId;
    function onSuccess(data) {
        clearTimeout(timeoutId);
        if (feedback)
            spinner_1.default.stop();
        return data;
    }
    function onError(error) {
        clearTimeout(timeoutId);
        if (feedback)
            spinner_1.default.stop();
        return Promise.reject(error);
    }
    const cfg = {
        method: 'GET',
        credentials: 'include',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/vnd.lichess.v' + exports.apiVersion + '+json'
        }
    };
    merge(cfg, opts);
    if ((cfg.method === 'POST' || cfg.method === 'PUT') &&
        !cfg.headers['Content-Type']) {
        cfg.headers['Content-Type'] = 'application/json; charset=UTF-8';
        if (!cfg.body) {
            cfg.body = '{}';
        }
    }
    if (opts && opts.query) {
        const query = querystring_1.buildQueryString(opts.query);
        if (query !== '') {
            url = addQuerystring(url, query);
        }
        delete opts.query;
    }
    const fullUrl = url.indexOf('http') > -1 ? url : baseUrl + url;
    const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject('Request timeout.'), 10000);
    });
    const reqPromise = fetch(fullUrl, cfg);
    const promise = Promise.race([
        reqPromise,
        timeoutPromise
    ]);
    if (feedback) {
        spinner_1.default.spin();
    }
    return promise
        .then(checkStatus)
        .then(onSuccess)
        .catch(onError);
}
exports.request = request;
function fetchJSON(url, opts, feedback = false) {
    return request(url, opts, feedback)
        .then(r => r.json());
}
exports.fetchJSON = fetchJSON;
function fetchText(url, opts, feedback = false) {
    return request(url, opts, feedback)
        .then(r => r.text());
}
exports.fetchText = fetchText;
