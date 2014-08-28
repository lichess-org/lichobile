/*
 * Qajax.js - Simple Promise ajax library based on Q
 */
/*jslint newcap: true */
(function (definition) {
  var Q;
  if (typeof exports === "object") {
    Q = require("q");
    module.exports = definition(Q);
  }
  else if (typeof define === 'function' && define.amd){
    define(['q'], definition);
  }
  else {
    Q = window.Q;
    window.Qajax = definition(Q);
  }
})(function (Q) {
  "use strict";

  // Qajax
  // ===
  // *Perform an asynchronous HTTP request (ajax).*
  //
  // Signatures
  // ---
  //
  // * `Qajax(url: String) => Promise[XHR]`
  // * `Qajax(options: Object) => Promise[XHR]`
  // * `Qajax(url: String, options: Object) => Promise[XHR]`
  //
  // Parameters
  // ---
  // `settings` **(object)** or **(string)** URL:
  //
  // - `url` **(string)**: the URL of the resource
  // - `method` **(string)** *optional*: the http method to use *(default: GET)*.
  // - `timeout` **(number)** *optional*: the time in ms to reject the XHR if not terminated.
  // - `data` **(any)** *optional*: the data to send.
  // - headers **(object)** *optional*: a map of headers to use for the XHR.
  // - `responseType` **(string)** *optional*: a responseType to set the XHR with.
  // - `cancellation` **(Promise)** *optional*: provide a "cancellation" promise which if fulfilled will cancel the current XHR.
  // - **Or any other parameter from the Qajax.defaults**.
  //
  // Result
  // ---
  // returns a **Promise of XHR**, whatever the status code is.
  //
  var Qajax = function () {
    var args = arguments, settings;
    /* Validating arguments */
    if (!args.length) {
      throw new Error("Qajax: settings are required");
    }
    if (typeof args[0] === "string") {
      settings = (typeof args[1] === 'object' && args[1]) || {};
      settings.url = args[0];
    }
    else if (typeof args[0] === "object"){
      settings = args[0];
    }
    else {
      throw new Error("Qajax: settings must be an object");
    }
    if (!settings.url) {
      throw new Error("Qajax: settings.url is required");
    }
    if ("cancellation" in settings && !Q.isPromiseAlike(settings.cancellation)) {
      throw new Error("cancellation must be a Promise.");
    }

    var xhr = new XMLHttpRequest(),
      cancellation = settings.cancellation || Q.defer().promise, // default is a never ending promise
      method = getOrElse("method", settings),
      base = getOrElse("base", settings),
      url = settings.url,
      data = settings.data,
      responseType = settings.responseType,
      params = settings.params || {},
      xhrResult = Q.defer(),
      timeout = getOrElse("timeout", settings),
      headers = extend1({}, getOrElse("headers", settings)),
      cacheParam = getOrElse("cache", settings);

    if (cacheParam) {
      params[cacheParam === true ? "_" : cacheParam] = (new Date()).getTime();
    }

    // Let's build the url based on the configuration
    // * Prepend the base if one
    if (base) {
      url = base + url;
    }

    // * Serialize and append the params if any
    var queryParams = serializeQuery(params);
    if (queryParams) {
      url = url + (hasQuery(url) ? "?" : "&") + queryParams;
    }

    // if data is a Javascript object, JSON is used
    if (data !== null && typeof data === "object") {
      if (!(CONTENT_TYPE in headers)) {
        headers[CONTENT_TYPE] = "application/json";
      }
      data = JSON.stringify(data);
    }

    return Q.fcall(function () { // Protect from any exception

      // Bind the XHR finished callback
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          try {
            log(method + " " + url + " => " + xhr.status);
            if (xhr.status) {
              xhrResult.resolve(xhr);
            } else {
              xhrResult.reject(xhr); // this case occured mainly when xhr.abort() has been called.
            }
          } catch (e) {
            xhrResult.reject(xhr); // IE could throw an error
          }
        }
      };

      xhr.onprogress = function (progress) {
          xhrResult.notify(progress);
      };

      // Open the XHR
      xhr.open(method, url, true);

      if (responseType) {
        xhr.responseType = responseType;
      }

      // Add headers
      for (var h in headers) {
        if (headers.hasOwnProperty(h)) {
          xhr.setRequestHeader(h, headers[h]);
        }
      }

      // Send the XHR
      if (data !== undefined && data !== null) {
        xhr.send(data);
      } else {
        xhr.send();
      }

      cancellation.fin(function () {
          if (!xhrResult.promise.isFulfilled()) {
              log("Qajax cancellation reached.");
              xhr.abort();
          }
      });

      // If no timeout, just return the promise
      if (!timeout) {
        return xhrResult.promise;
      }
      // Else, either the xhr promise or the timeout is reached
      else {
        return xhrResult.promise.timeout(timeout).fail(function (errorOrXHR) {
          // If timeout has reached (Error is triggered)
          if (errorOrXHR instanceof Error) {
            log("Qajax request delay reach in " + method + " " + url);
            xhr.abort(); // Abort this XHR so it can reject xhrResult
          }
          // Make the promise fail again.
          throw xhr;
        });
      }
    });
  };

  /*
   * DEPRECATED. Use Qajax.defaults.timeout instead.
   * Default XMLHttpRequest timeout.
   */
  Qajax.TIMEOUT = undefined;

  // Qajax Defaults
  // ===

  // Defaults settings of Qajax.
  // Feel free to override any of them.

  Qajax.defaults = {
    // `logs` **(boolean)**: Flag to enable logs
    logs: false,
    // `timeout` **(number)**: The timeout, in ms, to apply to the request.
    // If no response after that delay, the promise will be failed
    timeout: 60000,
    // `cache` **(boolean | string)**: cache flag to enable a hack appending the current timestamp
    // to your requests to prevent IE from caching them and always returning the same result.
    // If "true", will set the param with the name "_"
    // If a string, will use it as the param name
    cache: window.ActiveXObject || "ActiveXObject" in window,
    // `method` **(string)**: The default HTTP method to apply when calling Qajax(url) 
    method: "GET",
    // `header` **(object)**: The default HTTP headers to apply to your requests
    headers: {},
    // `base` **(string)**: The base of all urls of your requests. Will be prepend to all urls.
    base: ""
  };

  // Qajax.filterStatus
  // ===
  // *Filter an XHR to a given status, to consider only valid status to be success.*
  //
  // Parameters
  // ---
  // `validStatus` **(number or function)**: either a http code (like 200) or a predicate function (statusCode).
  //
  // Result
  // ---
  // Returns a **(function)** returning a Promise of XHR considered successful (according to validStatus)
  //
  // Usage example
  // ---
  // ```javascript
  // Qajax(settings).then(Qajax.filterStatus(200))
  //
  // Qajax(settings).then(
  //    Qajax.filterStatus(function(s){ return s == 200 })
  // )
  // ```
  //
  Qajax.filterStatus = function (validStatus) {
    var check, typ;
    typ = typeof validStatus;
    if (typ === "function") {
      check = validStatus;
    } else if (typ === "number") {
      check = function (s) {
        return s === validStatus;
      };
    } else {
      throw "validStatus type " + typ + " unsupported";
    }
    return function (xhr) {
      var status = 0;
      try {
        status = xhr.status; // IE can fail to access status
      } catch (e) {
        log("Qajax: failed to read xhr.status");
      }
      if (status === 1223) {
        status = 204; // 204 No Content IE bug
      }
      return check(status) ? Q.resolve(xhr) : Q.reject(xhr);
    };
  };

  // Qajax.filterSuccess
  // ===
  // *Filter all Success status code case.*
  // A good example of `Qajax.filterStatus` implementation.
  //
  Qajax.filterSuccess = Qajax.filterStatus(function (s) {
    return (s >= 200 && s < 300) || s === 304;
  });

  // Qajax.toJSON
  // ===
  // *Extract a JSON from a XHR.*
  // 
  // Parameters
  // ---
  // `xhr` **(XMLHttpRequest)**: the XHR.
  // 
  // Result
  // ---
  // A **(promise)** of the parsed JSON.
  //
  // Usage example
  // ---
  // ```
  // Qajax(settings).then(Qajax.toJSON)
  // ```
  //
  Qajax.toJSON = function (xhr) {
    return Q.fcall(function () {
      return JSON.parse(xhr.responseText);
    });
  };

  // Qajax.getJSON
  // ===
  // *Get a JSON from an URL - shortcut to Qajax.*
  //
  // Parameters
  // ---
  // `url` **(string)**: the ressource to fetch.
  // 
  // Result
  // ---
  // Returns a **(promise)** of a JS Object.
  //
  Qajax.getJSON = function (url) {
    return Qajax({ url: url, method: "GET" })
      .then(Qajax.filterSuccess)
      .then(Qajax.toJSON);
  };

  // Qajax.serialize
  // ===
  // *Make a query string from a JS Object.*
  // 
  // Parameters
  // ---
  // `paramsObj` **(object)** the params to serialize.
  //
  // Result
  // ---
  // Returns the serialized query **(string)**.
  //
  Qajax.serialize = serializeQuery;

  // Private util functions
  // ===

  // Get a param from the current settings of the request,
  // if missing, try to return the "else" argument,
  // if also missing, return it from the "defaults"
  function getOrElse(paramName, settings) {
    return paramName in settings ? settings[paramName] : Qajax.defaults[paramName];
  }

  function extend1 (extendee, object) {
    for (var key in object) {
      if (object.hasOwnProperty(key)) {
        extendee[key] = object[key];
      }
    }
    return extendee;
  }

  // Serialize a map of properties (as a JavaScript object) to a query string
  function serializeQuery(paramsObj) {
    var k, params = [];
    for (k in paramsObj) {
      if (paramsObj.hasOwnProperty(k)) {
        params.push(encodeURIComponent(k) + "=" + encodeURIComponent(paramsObj[k]));
      }
    }
    return params.join("&");
  }

  // Test if a given url has already a query string
  function hasQuery(url) {
    return (url.indexOf("?") === -1);
  }

  // safe log function
  function log (msg) {
    if (Qajax.defaults.logs && window.console) {
      console.log(msg);
    }
  }

  var CONTENT_TYPE = "Content-Type";

  return Qajax;

});
