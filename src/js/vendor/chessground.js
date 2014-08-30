/**
 * interact.js v1.0.17
 *
 * Copyright (c) 2012, 2013, 2014 Taye Adeyemi <dev@taye.me>
 * Open source under the MIT License.
 * https://raw.github.com/taye/interact.js/master/LICENSE
 *
 * We modified the wrapper function and env detection to allow interact to
 * be packaged with chessground
 */
(function () {
    'use strict';

    var document           = window.document,
        console            = window.console,
        SVGElement         = window.SVGElement         || blank,
        SVGSVGElement      = window.SVGSVGElement      || blank,
        SVGElementInstance = window.SVGElementInstance || blank,
        HTMLElement        = window.HTMLElement        || window.Element,

        // Use PointerEvents only if the Gesture API is also available
        Gesture      = window.Gesture || window.MSGesture,
        PointerEvent = Gesture && (window.PointerEvent || window.MSPointerEvent),
        GestureEvent = Gesture && (window.GestureEvent || window.MSGestureEvent),

        hypot = Math.hypot || function (x, y) { return Math.sqrt(x * x + y * y); },

        // Previous native pointer move event coordinates
        prevCoords = {
            pageX: 0,
            pageY: 0,
            clientX: 0,
            clientY: 0,
            timeStamp: 0
        },
        // current native pointer move event coordinates
        curCoords = {
            pageX: 0,
            pageY: 0,
            clientX: 0,
            clientY: 0,
            timeStamp: 0
        },

        // Starting InteractEvent pointer coordinates
        startCoords = {
            pageX: 0,
            pageY: 0,
            clientX: 0,
            clientY: 0,
            timeStamp: 0
        },

        // Change in coordinates and time of the pointer
        pointerDelta = {
            pageX: 0,
            pageY: 0,
            clientX: 0,
            clientY: 0,
            timeStamp: 0,
            pageSpeed: 0,
            clientSpeed: 0
        },

        // keep track of added PointerEvents if browser supports them
        pointerIds   = PointerEvent? []: null,
        pointerMoves = PointerEvent? []: null,

        downTime  = 0,         // the timeStamp of the starting event
        downEvent = null,      // gesturestart/mousedown/touchstart event
        prevEvent = null,      // previous action event
        tapTime   = 0,         // time of the most recent tap event
        prevTap   = null,

        tmpXY = {},     // reduce object creation in getXY()

        inertiaStatus = {
            active       : false,
            target       : null,
            targetElement: null,

            startEvent: null,
            pointerUp : {},

            xe : 0,
            ye : 0,
            duration: 0,

            t0 : 0,
            vx0: 0,
            vys: 0,

            lambda_v0: 0,
            one_ve_v0: 0,
            i  : null
        },

        gesture = {
            start: { x: 0, y: 0 },

            startDistance: 0,   // distance between two touches of touchStart
            prevDistance : 0,
            distance     : 0,

            scale: 1,           // gesture.distance / gesture.startDistance

            startAngle: 0,      // angle of line joining two touches
            prevAngle : 0       // angle of the previous gesture event
        },

        interactables   = [],   // all set interactables
        dropzones       = [],   // all dropzone element interactables

        selectorDZs     = [],   // all dropzone selector interactables
        matches         = [],   // all selectors that are matched by target element
        selectorGesture = null, // MSGesture object for selector PointerEvents

        // {
        //      type: {
        //          selectors: ['selector', ...],
        //          contexts : [document, ...],
        //          listeners: [[listener, useCapture], ...]
        //      }
        //  }
        delegatedEvents = {},

        target          = null, // current interactable being interacted with
        dropTarget      = null, // the dropzone a drag target might be dropped into
        dropElement     = null, // the element at the time of checking
        prevDropTarget  = null, // the dropzone that was recently dragged away from
        prevDropElement = null, // the element at the time of checking

        defaultOptions = {
            draggable   : false,
            dropzone    : false,
            accept      : null,
            resizable   : false,
            squareResize: false,
            resizeAxis  : 'xy',
            gesturable : false,

            actionChecker: null,

            styleCursor : true,

            // aww snap
            snap: {
                mode        : 'grid',
                endOnly     : false,
                actions     : ['drag'],
                range       : Infinity,
                grid        : { x: 100, y: 100 },
                gridOffset  : { x:   0, y:   0 },
                anchors     : [],
                paths       : [],

                arrayTypes  : /^anchors$|^paths$|^actions$/,
                objectTypes : /^grid$|^gridOffset$/,
                stringTypes : /^mode$/,
                numberTypes : /^range$/,
                boolTypes   :  /^endOnly$/
            },
            snapEnabled : false,

            restrict: {
                drag: null,
                resize: null,
                gesture: null,
                endOnly: false
            },
            restrictEnabled: true,

            autoScroll: {
                container   : window,  // the item that is scrolled (Window or HTMLElement)
                margin      : 60,
                speed       : 300,      // the scroll speed in pixels per second

                numberTypes : /^margin$|^speed$/
            },
            autoScrollEnabled: false,

            inertia: {
                resistance     : 10,    // the lambda in exponential decay
                minSpeed       : 100,   // target speed must be above this for inertia to start
                endSpeed       : 10,    // the speed at which inertia is slow enough to stop
                actions        : ['drag', 'resize'],
                zeroResumeDelta: false,

                numberTypes: /^resistance$|^minSpeed$|^endSpeed$/,
                arrayTypes : /^actions$/,
                boolTypes: /^zeroResumeDelta$/
            },
            inertiaEnabled: false,

            origin      : { x: 0, y: 0 },
            deltaSource : 'page',

            context     : document      // the Node on which querySelector will be called
        },

        snapStatus = {
            locked : false,
            x      : 0,
            y      : 0,
            dx     : 0,
            dy     : 0,
            realX  : 0,
            realY  : 0,
            anchors: [],
            paths  : []
        },

        restrictStatus = {
            dx: 0,
            dy: 0,
            snap: snapStatus,
            restricted: false
        },

        // Things related to autoScroll
        autoScroll = {
            target: null,
            i: null,    // the handle returned by window.setInterval
            x: 0,       // Direction each pulse is to scroll in
            y: 0,

            // scroll the window by the values in scroll.x/y
            scroll: function () {
                var options = autoScroll.target.options.autoScroll,
                    container = options.container,
                    now = new Date().getTime(),
                    // change in time in seconds
                    dt = (now - autoScroll.prevTime) / 1000,
                    // displacement
                    s = options.speed * dt;

                if (s >= 1) {
                    if (container instanceof window.Window) {
                        container.scrollBy(autoScroll.x * s, autoScroll.y * s);
                    }
                    else if (container) {
                        container.scrollLeft += autoScroll.x * s;
                        container.scrollTop  += autoScroll.y * s;
                    }

                    autoScroll.prevTime = now;
                }

                if (autoScroll.isScrolling) {
                    cancelFrame(autoScroll.i);
                    autoScroll.i = reqFrame(autoScroll.scroll);
                }
            },

            edgeMove: function (event) {
                if (target && target.options.autoScrollEnabled && (dragging || resizing)) {
                    var top,
                        right,
                        bottom,
                        left,
                        options = target.options.autoScroll;

                    if (options.container instanceof window.Window) {
                        left   = event.clientX < autoScroll.margin;
                        top    = event.clientY < autoScroll.margin;
                        right  = event.clientX > options.container.innerWidth  - autoScroll.margin;
                        bottom = event.clientY > options.container.innerHeight - autoScroll.margin;
                    }
                    else {
                        var rect = getElementRect(options.container);

                        left   = event.clientX < rect.left   + autoScroll.margin;
                        top    = event.clientY < rect.top    + autoScroll.margin;
                        right  = event.clientX > rect.right  - autoScroll.margin;
                        bottom = event.clientY > rect.bottom - autoScroll.margin;
                    }

                    autoScroll.x = (right ? 1: left? -1: 0);
                    autoScroll.y = (bottom? 1:  top? -1: 0);

                    if (!autoScroll.isScrolling) {
                        // set the autoScroll properties to those of the target
                        autoScroll.margin = options.margin;
                        autoScroll.speed  = options.speed;

                        autoScroll.start(target);
                    }
                }
            },

            isScrolling: false,
            prevTime: 0,

            start: function (target) {
                autoScroll.isScrolling = true;
                cancelFrame(autoScroll.i);

                autoScroll.target = target;
                autoScroll.prevTime = new Date().getTime();
                autoScroll.i = reqFrame(autoScroll.scroll);
            },

            stop: function () {
                autoScroll.isScrolling = false;
                cancelFrame(autoScroll.i);
            }
        },

        // Does the browser support touch input?
        supportsTouch = 'createTouch' in document,

        // Less Precision with touch input
        margin = supportsTouch? 20: 10,

        pointerIsDown   = false,
        pointerWasMoved = false,
        gesturing       = false,
        dragging        = false,
        dynamicDrop     = false,
        resizing        = false,
        resizeAxes      = 'xy',

        // What to do depending on action returned by getAction() of interactable
        // Dictates what styles should be used and what pointerMove event Listner
        // is to be added after pointerDown
        actions = {
            drag: {
                cursor      : 'move',
                moveListener: dragMove
            },
            resizex: {
                cursor      : 'e-resize',
                moveListener: resizeMove
            },
            resizey: {
                cursor      : 's-resize',
                moveListener: resizeMove
            },
            resizexy: {
                cursor      : 'se-resize',
                moveListener: resizeMove
            },
            gesture: {
                cursor      : '',
                moveListener: gestureMove
            }
        },

        actionIsEnabled = {
            drag   : true,
            resize : true,
            gesture: true
        },

        // Action that's ready to be fired on next move event
        prepared    = null,

        // because Webkit and Opera still use 'mousewheel' event type
        wheelEvent = 'onmousewheel' in document? 'mousewheel': 'wheel',

        eventTypes = [
            'dragstart',
            'dragmove',
            'draginertiastart',
            'dragend',
            'dragenter',
            'dragleave',
            'drop',
            'resizestart',
            'resizemove',
            'resizeinertiastart',
            'resizeend',
            'gesturestart',
            'gesturemove',
            'gestureinertiastart',
            'gestureend',

            'tap',
            'doubletap'
        ],

        globalEvents = {},

        fireStates = {
            directBind: 0,
            onevent   : 1,
            globalBind: 2
        },

        // Opera Mobile must be handled differently
        isOperaMobile = navigator.appName == 'Opera' &&
            supportsTouch &&
            navigator.userAgent.match('Presto'),

        // prefix matchesSelector
        matchesSelector = 'matchesSelector' in Element.prototype?
                'matchesSelector': 'webkitMatchesSelector' in Element.prototype?
                    'webkitMatchesSelector': 'mozMatchesSelector' in Element.prototype?
                        'mozMatchesSelector': 'oMatchesSelector' in Element.prototype?
                            'oMatchesSelector': 'msMatchesSelector',

        // will be polyfill function if browser is IE8
        IE8MatchesSelector,

        // native requestAnimationFrame or polyfill
        reqFrame = window.requestAnimationFrame,
        cancelFrame = window.cancelAnimationFrame,

        // used for adding event listeners to window and document
        windowTarget = {
            _element: window,
            events  : {}
        },
        docTarget = {
            _element: document,
            events  : {}
        },
        parentWindowTarget = {
            _element: window.parent,
            events  : {}
        },
        parentDocTarget = {
            _element: null,
            events  : {}
        },

        // Events wrapper
        events = (function () {
            var Event = window.Event,
                useAttachEvent = 'attachEvent' in window && !('addEventListener' in window),
                addEvent = !useAttachEvent?  'addEventListener': 'attachEvent',
                removeEvent = !useAttachEvent?  'removeEventListener': 'detachEvent',
                on = useAttachEvent? 'on': '',

                elements          = [],
                targets           = [],
                attachedListeners = [];

            if (!('indexOf' in Array.prototype)) {
                Array.prototype.indexOf = function(elt /*, from*/)   {
                var len = this.length >>> 0;

                var from = Number(arguments[1]) || 0;
                from = (from < 0)?
                    Math.ceil(from):
                    Math.floor(from);

                if (from < 0) {
                    from += len;
                }

                for (; from < len; from++) {
                    if (from in this && this[from] === elt) {
                        return from;
                    }
                }

                return -1;
                };
            }
            if (!('stopPropagation' in Event.prototype)) {
                Event.prototype.stopPropagation = function () {
                    this.cancelBubble = true;
                };
                Event.prototype.stopImmediatePropagation = function () {
                    this.cancelBubble = true;
                    this.immediatePropagationStopped = true;
                };
            }
            if (!('preventDefault' in Event.prototype)) {
                Event.prototype.preventDefault = function () {
                    this.returnValue = false;
                };
            }
            if (!('hasOwnProperty' in Event.prototype)) {
                /* jshint -W001 */ // ignore warning about setting IE8 Event#hasOwnProperty
                Event.prototype.hasOwnProperty = Object.prototype.hasOwnProperty;
            }

            function add (element, type, listener, useCapture) {
                var elementIndex = elements.indexOf(element),
                    target = targets[elementIndex];

                if (!target) {
                    target = {
                        events: {},
                        typeCount: 0
                    };

                    elementIndex = elements.push(element) - 1;
                    targets.push(target);

                    attachedListeners.push((useAttachEvent ? {
                            supplied: [],
                            wrapped:  [],
                            useCount: []
                        } : null));
                }

                if (!target.events[type]) {
                    target.events[type] = [];
                    target.typeCount++;
                }

                if (target.events[type].indexOf(listener) === -1) {
                    var ret;

                    if (useAttachEvent) {
                        var listeners = attachedListeners[elementIndex],
                            listenerIndex = listeners.supplied.indexOf(listener);

                        var wrapped = listeners.wrapped[listenerIndex] || function (event) {
                            if (!event.immediatePropagationStopped) {
                                event.target = event.srcElement;
                                event.currentTarget = element;

                                if (/mouse|click/.test(event.type)) {
                                    event.pageX = event.clientX + document.documentElement.scrollLeft;
                                    event.pageY = event.clientY + document.documentElement.scrollTop;
                                }

                                listener(event);
                            }
                        };

                        ret = element[addEvent](on + type, wrapped, Boolean(useCapture));

                        if (listenerIndex === -1) {
                            listeners.supplied.push(listener);
                            listeners.wrapped.push(wrapped);
                            listeners.useCount.push(1);
                        }
                        else {
                            listeners.useCount[listenerIndex]++;
                        }
                    }
                    else {
                        ret = element[addEvent](type, listener, useCapture || false);
                    }
                    target.events[type].push(listener);

                    return ret;
                }
            }

            function remove (element, type, listener, useCapture) {
                var i,
                    elementIndex = elements.indexOf(element),
                    target = targets[elementIndex],
                    listeners,
                    listenerIndex,
                    wrapped = listener;

                if (!target || !target.events) {
                    return;
                }

                if (useAttachEvent) {
                    listeners = attachedListeners[elementIndex];
                    listenerIndex = listeners.supplied.indexOf(listener);
                    wrapped = listeners.wrapped[listenerIndex];
                }

                if (type === 'all') {
                    for (type in target.events) {
                        if (target.events.hasOwnProperty(type)) {
                            remove(element, type, 'all');
                        }
                    }
                    return;
                }

                if (target.events[type]) {
                    var len = target.events[type].length;

                    if (listener === 'all') {
                        for (i = 0; i < len; i++) {
                            remove(element, type, target.events[type][i], Boolean(useCapture));
                        }
                    } else {
                        for (i = 0; i < len; i++) {
                            if (target.events[type][i] === listener) {
                                element[removeEvent](on + type, wrapped, useCapture || false);
                                target.events[type].splice(i, 1);

                                if (useAttachEvent && listeners) {
                                    listeners.useCount[listenerIndex]--;
                                    if (listeners.useCount[listenerIndex] === 0) {
                                        listeners.supplied.splice(listenerIndex, 1);
                                        listeners.wrapped.splice(listenerIndex, 1);
                                        listeners.useCount.splice(listenerIndex, 1);
                                    }
                                }

                                break;
                            }
                        }
                    }

                    if (target.events[type] && target.events[type].length === 0) {
                        target.events[type] = null;
                        target.typeCount--;
                    }
                }

                if (!target.typeCount) {
                    targets.splice(elementIndex);
                    elements.splice(elementIndex);
                    attachedListeners.splice(elementIndex);
                }
            }

            return {
                add: function (target, type, listener, useCapture) {
                    add(target._element, type, listener, useCapture);
                },
                remove: function (target, type, listener, useCapture) {
                    remove(target._element, type, listener, useCapture);
                },
                addToElement: add,
                removeFromElement: remove,
                useAttachEvent: useAttachEvent
            };
        }());

    function blank () {}

    function isElement (o) {
        return !!o && (
            typeof Element === "object" ? o instanceof Element : //DOM2
            o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string"
        );
    }

    function setEventXY (targetObj, source) {
        getPageXY(source, tmpXY);
        targetObj.pageX = tmpXY.x;
        targetObj.pageY = tmpXY.y;

        getClientXY(source, tmpXY);
        targetObj.clientX = tmpXY.x;
        targetObj.clientY = tmpXY.y;

        targetObj.timeStamp = new Date().getTime();
    }

    function setEventDeltas (targetObj, prev, cur) {
        targetObj.pageX     = cur.pageX      - prev.pageX;
        targetObj.pageY     = cur.pageY      - prev.pageY;
        targetObj.clientX   = cur.clientX    - prev.clientX;
        targetObj.clientY   = cur.clientY    - prev.clientY;
        targetObj.timeStamp = new Date().getTime() - prev.timeStamp;

        // set pointer velocity
        var dt = Math.max(targetObj.timeStamp / 1000, 0.001);
        targetObj.pageSpeed   = hypot(targetObj.pageX, targetObj.pageY) / dt;
        targetObj.pageVX      = targetObj.pageX / dt;
        targetObj.pageVY      = targetObj.pageY / dt;

        targetObj.clientSpeed = hypot(targetObj.clientX, targetObj.pageY) / dt;
        targetObj.clientVX      = targetObj.clientX / dt;
        targetObj.clientVY      = targetObj.clientY / dt;
    }

    // Get specified X/Y coords for mouse or event.touches[0]
    function getXY (type, event, xy) {
        var touch,
            x,
            y;

        xy = xy || {};
        type = type || 'page';

        if (/touch/.test(event.type) && event.touches) {
            touch = (event.touches.length)?
                event.touches[0]:
                event.changedTouches[0];
            x = touch[type + 'X'];
            y = touch[type + 'Y'];
        }
        else {
            x = event[type + 'X'];
            y = event[type + 'Y'];
        }

        xy.x = x;
        xy.y = y;

        return xy;
    }

    function getPageXY (event, page) {
        page = page || {};

        if (event instanceof InteractEvent) {
            if (/inertiastart/.test(event.type)) {
                getPageXY(inertiaStatus.pointerUp, page);

                page.x += inertiaStatus.sx;
                page.y += inertiaStatus.sy;
            }
            else {
                page.x = event.pageX;
                page.y = event.pageY;
            }
        }
        // Opera Mobile handles the viewport and scrolling oddly
        else if (isOperaMobile) {
            getXY('screen', event, page);

            page.x += window.scrollX;
            page.y += window.scrollY;
        }
        // MSGesture events don't have pageX/Y
        else if (/gesture|inertia/i.test(event.type)) {
            getXY('client', event, page);

            page.x += document.documentElement.scrollLeft;
            page.y += document.documentElement.scrollTop;
        }
        else {
            getXY('page', event, page);
        }

        return page;
    }

    function getClientXY (event, client) {
        client = client || {};

        if (event instanceof InteractEvent) {
            if (/inertiastart/.test(event.type)) {
                getClientXY(inertiaStatus.pointerUp, client);

                client.x += inertiaStatus.sx;
                client.y += inertiaStatus.sy;
            }
            else {
                client.x = event.clientX;
                client.y = event.clientY;
            }
        }
        else {
            // Opera Mobile handles the viewport and scrolling oddly
            getXY(isOperaMobile? 'screen': 'client', event, client);
        }

        return client;
    }

    function getScrollXY () {
        return {
            x: window.scrollX || document.documentElement.scrollLeft,
            y: window.scrollY || document.documentElement.scrollTop
        };
    }

    function getElementRect (element) {
        var scroll = /ipad|iphone|ipod/i.test(navigator.userAgent)
                ? { x: 0, y: 0 }
                : getScrollXY(),
            clientRect = (element instanceof SVGElement)?
                element.getBoundingClientRect():
                element.getClientRects()[0];

        return clientRect && {
            left  : clientRect.left   + scroll.x,
            right : clientRect.right  + scroll.x,
            top   : clientRect.top    + scroll.y,
            bottom: clientRect.bottom + scroll.y,
            width : clientRect.width || clientRect.right - clientRect.left,
            height: clientRect.heigh || clientRect.bottom - clientRect.top
        };
    }

    function getTouchPair (event) {
        var touches = [];

        if (event instanceof Array) {
            touches[0] = event[0];
            touches[1] = event[1];
        }
        else if (PointerEvent) {
            touches[0] = pointerMoves[0];
            touches[1] = pointerMoves[1];
        }
        else {
            touches[0] = event.touches[0];

            if (event.type === 'touchend' && event.touches.length === 1) {
                touches[1] = event.changedTouches[0];
            }
            else {
                touches[1] = event.touches[1];
            }
        }

        return touches;
    }

    function touchAverage (event) {
        var touches = getTouchPair(event);

        return {
            pageX: (touches[0].pageX + touches[1].pageX) / 2,
            pageY: (touches[0].pageY + touches[1].pageY) / 2,
            clientX: (touches[0].clientX + touches[1].clientX) / 2,
            clientY: (touches[0].clientY + touches[1].clientY) / 2,
        };
    }

    function touchBBox (event) {
        if (!(event.touches && event.touches.length) && !(PointerEvent && pointerMoves.length)) {
            return;
        }

        var touches = getTouchPair(event),
            minX = Math.min(touches[0].pageX, touches[1].pageX),
            minY = Math.min(touches[0].pageY, touches[1].pageY),
            maxX = Math.max(touches[0].pageX, touches[1].pageX),
            maxY = Math.max(touches[0].pageY, touches[1].pageY);

        return {
            x: minX,
            y: minY,
            left: minX,
            top: minY,
            width: maxX - minX,
            height: maxY - minY
        };
    }

    function touchDistance (event) {
        var deltaSource = (target && target.options || defaultOptions).deltaSource,
            sourceX = deltaSource + 'X',
            sourceY = deltaSource + 'Y',
            touches = getTouchPair(event);


        var dx = touches[0][sourceX] - touches[1][sourceX],
            dy = touches[0][sourceY] - touches[1][sourceY];

        return hypot(dx, dy);
    }

    function touchAngle (event, prevAngle) {
        var deltaSource = (target && target.options || defaultOptions).deltaSource,
            sourceX = deltaSource + 'X',
            sourceY = deltaSource + 'Y',
            touches = getTouchPair(event),
            dx = touches[0][sourceX] - touches[1][sourceX],
            dy = touches[0][sourceY] - touches[1][sourceY],
            angle = 180 * Math.atan(dy / dx) / Math.PI;

        if (typeof prevAngle === 'number') {
            var dr = angle - prevAngle,
                drClamped = dr % 360;

            if (drClamped > 315) {
                angle -= 360 + (angle / 360)|0 * 360;
            }
            else if (drClamped > 135) {
                angle -= 180 + (angle / 360)|0 * 360;
            }
            else if (drClamped < -315) {
                angle += 360 + (angle / 360)|0 * 360;
            }
            else if (drClamped < -135) {
                angle += 180 + (angle / 360)|0 * 360;
            }
        }

        return  angle;
    }

    function getOriginXY (interactable, element) {
        interactable = interactable || target;

        var origin = interactable
                ? interactable.options.origin
                : defaultOptions.origin;

        element = element || interactable._element;

        if (origin === 'parent') {
            origin = element.parentNode;
        }
        else if (origin === 'self') {
            origin = element;
        }

        if (isElement(origin))  {
            origin = getElementRect(origin);

            origin.x = origin.left;
            origin.y = origin.top;
        }
        else if (typeof origin === 'function') {
            origin = origin(interactable && element);
        }

        return origin;
    }

    function calcRects (interactableList) {
        for (var i = 0, len = interactableList.length; i < len; i++) {
            interactableList[i].rect = interactableList[i].getRect();
        }
    }

    function inertiaFrame () {
        var options = inertiaStatus.target.options.inertia,
            lambda = options.resistance,
            t = new Date().getTime() / 1000 - inertiaStatus.t0;

        if (t < inertiaStatus.te) {

            var progress =  1 - (Math.exp(-lambda * t) - inertiaStatus.lambda_v0) / inertiaStatus.one_ve_v0;

            if (inertiaStatus.modifiedXe === inertiaStatus.xe && inertiaStatus.modifiedYe === inertiaStatus.ye) {
                inertiaStatus.sx = inertiaStatus.xe * progress;
                inertiaStatus.sy = inertiaStatus.ye * progress;
            }
            else {
                var quadPoint = getQuadraticCurvePoint(
                        0, 0,
                        inertiaStatus.xe, inertiaStatus.ye,
                        inertiaStatus.modifiedXe, inertiaStatus.modifiedYe,
                        progress);

                inertiaStatus.sx = quadPoint.x;
                inertiaStatus.sy = quadPoint.y;
            }

            pointerMove(inertiaStatus.startEvent);

            inertiaStatus.i = reqFrame(inertiaFrame);
        }
        else {
            inertiaStatus.sx = inertiaStatus.modifiedXe;
            inertiaStatus.sy = inertiaStatus.modifiedYe;

            inertiaStatus.active = false;

            pointerMove(inertiaStatus.startEvent);
            pointerUp(inertiaStatus.startEvent);
        }
    }

    function _getQBezierValue(t, p1, p2, p3) {
        var iT = 1 - t;
        return iT * iT * p1 + 2 * iT * t * p2 + t * t * p3;
    }

    function getQuadraticCurvePoint(startX, startY, cpX, cpY, endX, endY, position) {
        return {
            x:  _getQBezierValue(position, startX, cpX, endX),
            y:  _getQBezierValue(position, startY, cpY, endY)
        };
    }

    function nodeContains (parent, child) {
        while ((child = child.parentNode)) {

            if (child === parent) {
                return true;
            }
        }

        return false;
    }

    function inContext (interactable, element) {
        return interactable._context === document
                || nodeContains(interactable._context, element);
    }

    function testIgnore (interactable, element) {
        var ignoreFrom = interactable.options.ignoreFrom;

        if (!element || !isElement(element)) { return false; }

        if (typeof ignoreFrom === 'string') {
            return element[matchesSelector](ignoreFrom) || testIgnore(interactable, element.parentNode);
        }
        else if (isElement(ignoreFrom)) {
            return element === ignoreFrom || nodeContains(ignoreFrom, element);
        }

        return false;
    }

    // Test for the element that's "above" all other qualifiers
    function resolveDrops (elements) {
        if (elements.length) {

            var dropzone,
                deepestZone = elements[0],
                parent,
                deepestZoneParents = [],
                dropzoneParents = [],
                child,
                i,
                n;

            for (i = 1; i < elements.length; i++) {
                dropzone = elements[i];

                // check if the deepest or current are document.documentElement or document.rootElement
                // - if deepest is, update with the current dropzone and continue to next
                if (deepestZone.parentNode === document) {
                    deepestZone = dropzone;
                    continue;
                }
                // - if the current dropzone is, do nothing and continue
                else if (dropzone.parentNode === document) {
                    continue;
                }

                if (!deepestZoneParents.length) {
                    parent = deepestZone;
                    while (parent.parentNode !== document) {
                        deepestZoneParents.unshift(parent);
                        parent = parent.parentNode;
                    }
                }

                // if this element is an svg element and the current deepest is
                // an HTMLElement
                if (deepestZone instanceof HTMLElement &&
                        dropzone instanceof SVGElement &&
                        !(dropzone instanceof SVGSVGElement)) {

                    if (dropzone ===
                            deepestZone.parentNode) {
                        continue;
                    }
                    parent = dropzone.ownerSVGElement;
                }
                else {
                    parent = dropzone;
                }
                dropzoneParents = [];
                while (parent.parentNode !== document) {
                    dropzoneParents.unshift(parent);
                    parent = parent.parentNode;
                }

                // get (position of last common ancestor) + 1
                n = 0;
                while(dropzoneParents[n] &&
                        dropzoneParents[n] === deepestZoneParents[n]) {
                    n++;
                }

                var parents = [
                    dropzoneParents[n - 1],
                    dropzoneParents[n],
                    deepestZoneParents[n]
                ];
                child = parents[0].lastChild;

                while (child) {
                    if (child === parents[1]) {
                        deepestZone = dropzone;
                        deepestZoneParents = [];
                        break;
                    }
                    else if (child === parents[2]) {
                        break;
                    }
                    child = child.previousSibling;
                }
            }
            return {
                element: deepestZone,
                index: elements.indexOf(deepestZone)
            };
        }
    }

    function getDrop (event, element) {
        if (dropzones.length || selectorDZs.length) {
            var i,
                drops = [],
                elements = [],
                selectorDrops = [],
                selectorElements = [],
                drop,
                dropzone;

            element = element || target._element;

            // collect all element dropzones that qualify for a drop
            for (i = 0; i < dropzones.length; i++) {
                var current = dropzones[i];

                // if the dropzone has an accept option, test against it
                if (isElement(current.options.accept)) {
                    if (current.options.accept !== element) {
                        continue;
                    }
                }
                else if (typeof current.options.accept === 'string') {
                    if (!element[matchesSelector](current.options.accept)) {
                        continue;
                    }
                }

                if (element !== current._element && current.dropCheck(event, target, element)) {
                    drops.push(current);
                    elements.push(current._element);
                }
            }

            // get the most apprpriate dropzone based on DOM depth and order
            drop = resolveDrops(elements);
            dropzone = drop? drops[drop.index]: null;

            if (selectorDZs.length) {
                for (i = 0; i < selectorDZs.length; i++) {
                    var selector = selectorDZs[i],
                        context = selector._context,
                        nodeList = context.querySelectorAll(selector.selector);

                    for (var j = 0, len = nodeList.length; j < len; j++) {
                        selector._element = nodeList[j];
                        selector.rect = selector.getRect();

                        // if the dropzone has an accept option, test against it
                        if (isElement(selector.options.accept)) {
                            if (selector.options.accept !== element) {
                                continue;
                            }
                        }
                        else if (typeof selector.options.accept === 'string') {
                            if (!element[matchesSelector](selector.options.accept)) {
                                continue;
                            }
                        }

                        if (selector._element !== element
                            && elements.indexOf(selector._element) === -1
                            && selectorElements.indexOf(selector._element) === -1
                            && selector.dropCheck(event, target)) {

                            selectorDrops.push(selector);
                            selectorElements.push(selector._element);
                        }
                    }
                }

                if (selectorElements.length) {
                    if (dropzone) {
                        selectorDrops.push(dropzone);
                        selectorElements.push(dropzone._element);
                    }

                    drop = resolveDrops(selectorElements);

                    if (drop) {
                        dropzone = selectorDrops[drop.index];

                        if (dropzone.selector) {
                            dropzone._element = selectorElements[drop.index];
                        }
                    }
                }
            }

            return dropzone? {
                dropzone: dropzone,
                element: dropzone._element
            }: null;
        }
    }

    function InteractEvent (event, action, phase, element, related) {
        var client,
            page,
            deltaSource = (target && target.options || defaultOptions).deltaSource,
            sourceX = deltaSource + 'X',
            sourceY = deltaSource + 'Y',
            options = target? target.options: defaultOptions,
            origin = getOriginXY(target, element);

        element = element || target._element;

        if (action === 'gesture') {
            var average = touchAverage(event);

            page   = { x: (average.pageX   - origin.x), y: (average.pageY   - origin.y) };
            client = { x: (average.clientX - origin.x), y: (average.clientY - origin.y) };
        }
        else {

            page   = getPageXY(event);
            client = getClientXY(event);

            page.x -= origin.x;
            page.y -= origin.y;

            client.x -= origin.x;
            client.y -= origin.y;

            if (options.snapEnabled && options.snap.actions.indexOf(action) !== -1) {

                this.snap = {
                    range  : snapStatus.range,
                    locked : snapStatus.locked,
                    x      : snapStatus.x,
                    y      : snapStatus.y,
                    realX  : snapStatus.realX,
                    realY  : snapStatus.realY,
                    dx     : snapStatus.dx,
                    dy     : snapStatus.dy
                };

                if (snapStatus.locked) {
                    page.x += snapStatus.dx;
                    page.y += snapStatus.dy;
                    client.x += snapStatus.dx;
                    client.y += snapStatus.dy;
                }
            }
        }

        if (target.options.restrict[action] && restrictStatus.restricted) {
            page.x += restrictStatus.dx;
            page.y += restrictStatus.dy;
            client.x += restrictStatus.dx;
            client.y += restrictStatus.dy;

            this.restrict = {
                dx: restrictStatus.dx,
                dy: restrictStatus.dy
            };
        }

        this.pageX     = page.x;
        this.pageY     = page.y;
        this.clientX   = client.x;
        this.clientY   = client.y;

        if (phase === 'start' && !(event instanceof InteractEvent)) {
            setEventXY(startCoords, this);
        }

        this.x0        = startCoords.pageX;
        this.y0        = startCoords.pageY;
        this.clientX0  = startCoords.clientX;
        this.clientY0  = startCoords.clientY;
        this.ctrlKey   = event.ctrlKey;
        this.altKey    = event.altKey;
        this.shiftKey  = event.shiftKey;
        this.metaKey   = event.metaKey;
        this.button    = event.button;
        this.target    = element;
        this.t0        = downTime;
        this.type      = action + (phase || '');

        if (inertiaStatus.active) {
            this.detail = 'inertia';
        }

        if (related) {
            this.relatedTarget = related;
        }

        if (prevEvent && prevEvent.detail === 'inertia'
            && !inertiaStatus.active && options.inertia.zeroResumeDelta) {
            this.dx = this.dy = 0;
        }
        // end event dx, dy is difference between start and end points
        else if (phase === 'end' || action === 'drop') {
            if (deltaSource === 'client') {
                this.dx = client.x - startCoords.clientX;
                this.dy = client.y - startCoords.clientY;
            }
            else {
                this.dx = page.x - startCoords.pageX;
                this.dy = page.y - startCoords.pageY;
            }
        }
        // copy properties from previousmove if starting inertia
        else if (phase === 'inertiastart') {
            this.dx = prevEvent.dx;
            this.dy = prevEvent.dy;
        }
        else {
            if (deltaSource === 'client') {
                this.dx = client.x - prevEvent.clientX;
                this.dy = client.y - prevEvent.clientY;
            }
            else {
                this.dx = page.x - prevEvent.pageX;
                this.dy = page.y - prevEvent.pageY;
            }
        }

        if (action === 'resize') {
            if (options.squareResize || event.shiftKey) {
                if (resizeAxes === 'y') {
                    this.dx = this.dy;
                }
                else {
                    this.dy = this.dx;
                }
                this.axes = 'xy';
            }
            else {
                this.axes = resizeAxes;

                if (resizeAxes === 'x') {
                    this.dy = 0;
                }
                else if (resizeAxes === 'y') {
                    this.dx = 0;
                }
            }
        }
        else if (action === 'gesture') {
            this.touches = (PointerEvent
                            ? [pointerMoves[0], pointerMoves[1]]
                            : event.touches);

            if (phase === 'start') {
                this.distance = touchDistance(event);
                this.box      = touchBBox(event);
                this.scale    = 1;
                this.ds       = 0;
                this.angle    = touchAngle(event);
                this.da       = 0;
            }
            else if (phase === 'end' || event instanceof InteractEvent) {
                this.distance = prevEvent.distance;
                this.box      = prevEvent.box;
                this.scale    = prevEvent.scale;
                this.ds       = this.scale - 1;
                this.angle    = prevEvent.angle;
                this.da       = this.angle - gesture.startAngle;
            }
            else {
                this.distance = touchDistance(event);
                this.box      = touchBBox(event);
                this.scale    = this.distance / gesture.startDistance;
                this.angle    = touchAngle(event, gesture.prevAngle);

                this.ds = this.scale - gesture.prevScale;
                this.da = this.angle - gesture.prevAngle;
            }
        }

        if (phase === 'start') {
            this.timeStamp = downTime;
            this.dt        = 0;
            this.duration  = 0;
            this.speed     = 0;
            this.velocityX = 0;
            this.velocityY = 0;
        }
        else if (phase === 'inertiastart') {
            this.timeStamp = new Date().getTime();
            this.dt        = prevEvent.dt;
            this.duration  = prevEvent.duration;
            this.speed     = prevEvent.speed;
            this.velocityX = prevEvent.velocityX;
            this.velocityY = prevEvent.velocityY;
        }
        else {
            this.timeStamp = new Date().getTime();
            this.dt        = this.timeStamp - prevEvent.timeStamp;
            this.duration  = this.timeStamp - downTime;

            var dx, dy, dt;

            // Use natural event coordinates (without snapping/restricions)
            // subtract modifications from previous event if event given is
            // not a native event
            if (phase === 'end' || event instanceof InteractEvent) {
                // change in time in seconds
                // use event sequence duration for end events
                // => average speed of the event sequence
                // (minimum dt of 1ms)
                dt = Math.max((phase === 'end'? this.duration: this.dt) / 1000, 0.001);
                dx = this[sourceX] - prevEvent[sourceX];
                dy = this[sourceY] - prevEvent[sourceY];

                if (this.snap && this.snap.locked) {
                    dx -= this.snap.dx;
                    dy -= this.snap.dy;
                }

                if (this.restrict) {
                    dx -= this.restrict.dx;
                    dy -= this.restrict.dy;
                }

                if (prevEvent.snap && prevEvent.snap.locked) {
                    dx -= (prevEvent[sourceX] - prevEvent.snap.dx);
                    dy -= (prevEvent[sourceY] - prevEvent.snap.dy);
                }

                if (prevEvent.restrict) {
                    dx += prevEvent.restrict.dx;
                    dy += prevEvent.restrict.dy;
                }

                // speed and velocity in pixels per second
                this.speed = hypot(dx, dy) / dt;
                this.velocityX = dx / dt;
                this.velocityY = dy / dt;
            }
            // if normal move event, use previous user event coords
            else {
                this.speed = pointerDelta[deltaSource + 'Speed'];
                this.velocityX = pointerDelta[deltaSource + 'VX'];
                this.velocityY = pointerDelta[deltaSource + 'VY'];
            }
        }
    }

    InteractEvent.prototype = {
        preventDefault: blank,
        stopImmediatePropagation: function () {
            this.immediatePropagationStopped = this.propagationStopped = true;
        },
        stopPropagation: function () {
            this.propagationStopped = true;
        }
    };

    function preventOriginalDefault () {
        this.originalEvent.preventDefault();
    }

    function fireTaps (event, targets, elements) {
        var tap = {},
            prop, i;

        for (prop in event) {
            tap[prop] = event[prop];
        }

        tap.preventDefault           = preventOriginalDefault;
        tap.stopPropagation          = InteractEvent.prototype.stopPropagation;
        tap.stopImmediatePropagation = InteractEvent.prototype.stopImmediatePropagation;

        tap.timeStamp     = new Date().getTime();
        tap.originalEvent = event;
        tap.dt            = tap.timeStamp - downTime;
        tap.type          = 'tap';

        var interval = tap.timeStamp - tapTime,
            dbl = (prevTap && prevTap.type !== 'doubletap'
                   && prevTap.target === tap.target
                   && interval < 500);

        tapTime = tap.timeStamp;

        for (i = 0; i < targets.length; i++) {
            var origin = getOriginXY(targets[i], elements[i]);

            tap.pageX -= origin.x;
            tap.pageY -= origin.y;
            tap.clientX -= origin.x;
            tap.clientY -= origin.y;

            tap.currentTarget = elements[i];
            targets[i].fire(tap);

            if (tap.immediatePropagationStopped
                ||(tap.propagationStopped && targets[i + 1] !== tap.currentTarget)) {
                break;
            }
        }

        if (dbl) {
            var doubleTap = {};

            for (prop in tap) {
                doubleTap[prop] = tap[prop];
            }

            doubleTap.dt   = interval;
            doubleTap.type = 'doubletap';

            for (i = 0; i < targets.length; i++) {
                doubleTap.currentTarget = elements[i];
                targets[i].fire(doubleTap);

                if (doubleTap.immediatePropagationStopped
                    ||(doubleTap.propagationStopped && targets[i + 1] !== doubleTap.currentTarget)) {
                    break;
                }
            }

            prevTap = doubleTap;
        }
        else {
            prevTap = tap;
        }
    }

    function collectTaps (event) {
        if(downEvent) {
            if (pointerWasMoved
                || !(event instanceof downEvent.constructor)
                || downEvent.target !== event.target) {
                return;
            }
        }

        var tapTargets = [],
            tapElements = [];

        var eventTarget = (event.target instanceof SVGElementInstance
                ? event.target.correspondingUseElement
                : event.target),
            element = eventTarget;

        function collectSelectorTaps (interactable, selector, context) {
            var elements = Element.prototype[matchesSelector] === IE8MatchesSelector
                    ? context.querySelectorAll(selector)
                    : undefined;

            if (element !== document
                && inContext(interactable, element)
                && !testIgnore(interactable, eventTarget)
                && element[matchesSelector](selector, elements)) {

                tapTargets.push(interactable);
                tapElements.push(element);
            }
        }

        while (element) {
            if (interact.isSet(element)) {
                tapTargets.push(interact(element));
                tapElements.push(element);
            }

            interactables.forEachSelector(collectSelectorTaps);

            element = element.parentNode;
        }

        if (tapTargets.length) {
            fireTaps(event, tapTargets, tapElements);
        }
    }

    function defaultActionChecker (event) {
        var rect = this.getRect(),
            right,
            bottom,
            action = null,
            page = getPageXY(event),
            options = this.options;

        if (!rect) { return null; }

        if (actionIsEnabled.resize && options.resizable) {
            right  = options.resizeAxis !== 'y' && page.x > (rect.right  - margin);
            bottom = options.resizeAxis !== 'x' && page.y > (rect.bottom - margin);
        }

        resizeAxes = (right?'x': '') + (bottom?'y': '');

        action = (resizeAxes)?
            'resize' + resizeAxes:
            actionIsEnabled.drag && options.draggable?
                'drag':
                null;

        if (actionIsEnabled.gesture
            && ((event.touches && event.touches.length >= 2)
                || (PointerEvent && pointerIds.length >=2)) &&
                !(dragging || resizing)) {
            action = 'gesture';
        }

        return action;
    }

    // Check if action is enabled globally and the current target supports it
    // If so, return the validated action. Otherwise, return null
    function validateAction (action, interactable) {
        if (typeof action !== 'string') { return null; }

        interactable = interactable || target;

        var actionType = action.indexOf('resize') !== -1? 'resize': action,
            options = (interactable || target).options;

        if ((  (actionType  === 'resize'   && options.resizable )
            || (action      === 'drag'     && options.draggable  )
            || (action      === 'gesture'  && options.gesturable))
            && actionIsEnabled[actionType]) {

            if (action === 'resize' || action === 'resizeyx') {
                action = 'resizexy';
            }

            return action;
        }
        return null;
    }

    function selectorDown (event) {
        if (prepared && downEvent && event.type !== downEvent.type) {
            if (!(/^input$|^textarea$/i.test(target._element.nodeName))) {
                event.preventDefault();
            }
            return;
        }

        // try to ignore browser simulated mouse after touch
        if (downEvent
            && event.type === 'mousedown' && downEvent.type === 'touchstart'
            && event.timeStamp - downEvent.timeStamp < 300) {
            return;
        }

        var eventTarget = (event.target instanceof SVGElementInstance
            ? event.target.correspondingUseElement
            : event.target),
            element = eventTarget,
            action;

        if (PointerEvent) {
            addPointer(event);
        }

        // Check if the down event hits the current inertia target
        if (inertiaStatus.active && target.selector) {
            // climb up the DOM tree from the event target
            while (element && element !== document) {

                // if this element is the current inertia target element
                if (element === inertiaStatus.targetElement
                    // and the prospective action is the same as the ongoing one
                    && validateAction(target.getAction(event)) === prepared) {

                    // stop inertia so that the next move will be a normal one
                    cancelFrame(inertiaStatus.i);
                    inertiaStatus.active = false;

                    if (PointerEvent) {
                        // add the pointer to the gesture object
                        addPointer(event, selectorGesture);
                    }

                    return;
                }
                element = element.parentNode;
            }
        }

        // do nothing if interacting
        if (dragging || resizing || gesturing) {
            return;
        }

        function pushMatches (interactable, selector, context) {
            var elements = Element.prototype[matchesSelector] === IE8MatchesSelector
                ? context.querySelectorAll(selector)
                : undefined;

            if (inContext(interactable, element)
                && !testIgnore(interactable, eventTarget)
                && element[matchesSelector](selector, elements)) {

                interactable._element = element;
                matches.push(interactable);
            }
        }

        if (matches.length && /mousedown|pointerdown/i.test(event.type)) {
            action = validateSelector(event, matches);
        }
        else {
            while (element && element !== document && !action) {
                matches = [];

                interactables.forEachSelector(pushMatches);

                action = validateSelector(event, matches);
                element = element.parentNode;
            }
        }

        if (action) {
            pointerIsDown = true;
            prepared = action;

            return pointerDown(event, action);
        }
        else {
            // do these now since pointerDown isn't being called from here
            downTime = new Date().getTime();
            downEvent = event;
            setEventXY(prevCoords, event);
            pointerWasMoved = false;
        }
    }

    // Determine action to be performed on next pointerMove and add appropriate
    // style and event Liseners
    function pointerDown (event, forceAction) {
        if (!forceAction && pointerIsDown && downEvent && event.type !== downEvent.type) {
            if (!(/^input$|^textarea$/i.test(target._element.nodeName))) {
                event.preventDefault();
            }
            return;
        }

        pointerIsDown = true;

        if (PointerEvent) {
            addPointer(event);
        }

        // If it is the second touch of a multi-touch gesture, keep the target
        // the same if a target was set by the first touch
        // Otherwise, set the target if there is no action prepared
        if ((((event.touches && event.touches.length < 2) || (pointerIds && pointerIds.length < 2)) && !target)
            || !prepared) {

            var interactable = interactables.get(event.currentTarget);

            if (!testIgnore(interactable, event.target)) {
                target = interactable;
            }
        }

        var options = target && target.options;

        if (target && !(dragging || resizing || gesturing)) {
            var action = validateAction(forceAction || target.getAction(event));

            setEventXY(startCoords, event);

            if (PointerEvent && event instanceof PointerEvent) {
                // Dom modification seems to reset the gesture target
                if (!target._gesture.target) {
                    target._gesture.target = target._element;
                }

                addPointer(event, target._gesture);
            }

            if (!action) {
                return event;
            }

            pointerWasMoved = false;

            if (options.styleCursor) {
                document.documentElement.style.cursor = actions[action].cursor;
            }

            resizeAxes = action === 'resizexy'?
                    'xy':
                    action === 'resizex'?
                        'x':
                        action === 'resizey'?
                            'y':
                            '';

            if (action === 'gesture'
                && ((event.touches && event.touches.length < 2)
                    || PointerEvent && pointerIds.length < 2)) {
                        action = null;
            }

            prepared = action;

            snapStatus.x = null;
            snapStatus.y = null;

            downTime = new Date().getTime();
            downEvent = event;
            setEventXY(prevCoords, event);
            pointerWasMoved = false;

            if (!(/^input$|^textarea$/i.test(target._element.nodeName))) {
                event.preventDefault();
            }
        }
        // if inertia is active try to resume action
        else if (inertiaStatus.active
            && event.currentTarget === inertiaStatus.targetElement
            && target === inertiaStatus.target
            && validateAction(target.getAction(event)) === prepared) {

            cancelFrame(inertiaStatus.i);
            inertiaStatus.active = false;

            if (PointerEvent) {
                if (!target._gesture.target) {
                    target._gesture.target = target._element;
                }
                // add the pointer to the gesture object
                addPointer(event, target._gesture);
            }
        }
    }

    function setSnapping (event, status) {
        var snap = target.options.snap,
            anchors = snap.anchors,
            page,
            closest,
            range,
            inRange,
            snapChanged,
            dx,
            dy,
            distance,
            i, len;

        status = status || snapStatus;

        if (status.useStatusXY) {
            page = { x: status.x, y: status.y };
        }
        else {
            var origin = getOriginXY(target);

            page = getPageXY(event);

            page.x -= origin.x;
            page.y -= origin.y;
        }

        status.realX = page.x;
        status.realY = page.y;

        // change to infinite range when range is negative
        if (snap.range < 0) { snap.range = Infinity; }

        // create an anchor representative for each path's returned point
        if (snap.mode === 'path') {
            anchors = [];

            for (i = 0, len = snap.paths.length; i < len; i++) {
                var path = snap.paths[i];

                if (typeof path === 'function') {
                    path = path(page.x, page.y);
                }

                anchors.push({
                    x: typeof path.x === 'number' ? path.x : page.x,
                    y: typeof path.y === 'number' ? path.y : page.y,

                    range: typeof path.range === 'number'? path.range: snap.range
                });
            }
        }

        if ((snap.mode === 'anchor' || snap.mode === 'path') && anchors.length) {
            closest = {
                anchor: null,
                distance: 0,
                range: 0,
                dx: 0,
                dy: 0
            };

            for (i = 0, len = anchors.length; i < len; i++) {
                var anchor = anchors[i];

                range = typeof anchor.range === 'number'? anchor.range: snap.range;

                dx = anchor.x - page.x;
                dy = anchor.y - page.y;
                distance = hypot(dx, dy);

                inRange = distance < range;

                // Infinite anchors count as being out of range
                // compared to non infinite ones that are in range
                if (range === Infinity && closest.inRange && closest.range !== Infinity) {
                    inRange = false;
                }

                if (!closest.anchor || (inRange?
                    // is the closest anchor in range?
                    (closest.inRange && range !== Infinity)?
                        // the pointer is relatively deeper in this anchor
                        distance / range < closest.distance / closest.range:
                        //the pointer is closer to this anchor
                        distance < closest.distance:
                    // The other is not in range and the pointer is closer to this anchor
                    (!closest.inRange && distance < closest.distance))) {

                    if (range === Infinity) {
                        inRange = true;
                    }

                    closest.anchor = anchor;
                    closest.distance = distance;
                    closest.range = range;
                    closest.inRange = inRange;
                    closest.dx = dx;
                    closest.dy = dy;

                    status.range = range;
                }
            }

            inRange = closest.inRange;
            snapChanged = (closest.anchor.x !== status.x || closest.anchor.y !== status.y);

            status.x = closest.anchor.x;
            status.y = closest.anchor.y;
            status.dx = closest.dx;
            status.dy = closest.dy;
        }
        else if (snap.mode === 'grid') {
            var gridx = Math.round((page.x - snap.gridOffset.x) / snap.grid.x),
                gridy = Math.round((page.y - snap.gridOffset.y) / snap.grid.y),

                newX = gridx * snap.grid.x + snap.gridOffset.x,
                newY = gridy * snap.grid.y + snap.gridOffset.y;

            dx = newX - page.x;
            dy = newY - page.y;

            distance = hypot(dx, dy);

            inRange = distance < snap.range;
            snapChanged = (newX !== status.x || newY !== status.y);

            status.x = newX;
            status.y = newY;
            status.dx = dx;
            status.dy = dy;

            status.range = snap.range;
        }

        status.changed = (snapChanged || (inRange && !status.locked));
        status.locked = inRange;

        return status;
    }

    function setRestriction (event, status) {
        var action = interact.currentAction() || prepared,
            restriction = target && target.options.restrict[action],
            page;

        status = status || restrictStatus;

        page = status.useStatusXY
                ? page = { x: status.x, y: status.y }
                : page = getPageXY(event);

        if (status.snap && status.snap.locked) {
            page.x += status.snap.dx || 0;
            page.y += status.snap.dy || 0;
        }

        status.dx = 0;
        status.dy = 0;
        status.restricted = false;

        if (!action || !restriction) {
            return status;
        }

        var rect;

        if (restriction === 'parent') {
            restriction = target._element.parentNode;
        }
        else if (restriction === 'self') {
            restriction = target._element;
        }

        if (isElement(restriction)) {
            rect = getElementRect(restriction);
        }
        else {
            if (typeof restriction === 'function') {
                restriction = restriction(page.x, page.y, target._element);
            }

            rect = restriction;

            // object is assumed to have
            // x, y, width, height or
            // left, top, right, bottom
            if ('x' in restriction && 'y' in restriction) {
                rect = {
                    left  : restriction.x,
                    top   : restriction.y,
                    right : restriction.x + restriction.width,
                    bottom: restriction.y + restriction.height
                };
            }
        }

        status.dx = Math.max(Math.min(rect.right , page.x), rect.left) - page.x;
        status.dy = Math.max(Math.min(rect.bottom, page.y), rect.top ) - page.y;
        status.restricted = true;

        return status;
    }

    function pointerMove (event, preEnd) {
        if (!pointerIsDown) { return; }

        if (!(event instanceof InteractEvent)) {
            setEventXY(curCoords, event);
        }

        // register movement of more than 1 pixel
        if (!pointerWasMoved) {
            var dx = curCoords.clientX - startCoords.clientX,
                dy = curCoords.clientY - startCoords.clientY;

            pointerWasMoved = hypot(dx, dy) > 1;
        }

        // return if there is no prepared action
        if (!prepared
            // or this is a mousemove event but the down event was a touch
            || (event.type === 'mousemove' && downEvent.type === 'touchstart')) {

            return;
        }

        if (pointerWasMoved
            // ignore movement while inertia is active
            && (!inertiaStatus.active || (event instanceof InteractEvent && /inertiastart/.test(event.type)))) {

            // if just starting an action, calculate the pointer speed now
            if (!(dragging || resizing || gesturing)) {
                setEventDeltas(pointerDelta, prevCoords, curCoords);
            }

            if (prepared && target) {
                var shouldRestrict = target.options.restrictEnabled && (!target.options.restrict.endOnly || preEnd),
                    starting = !(dragging || resizing || gesturing),
                    snapEvent = starting? downEvent: event;

                if (starting) {
                    prevEvent = downEvent;
                }

                if (!shouldRestrict) {
                    restrictStatus.restricted = false;
                }

                // check for snap
                if (target.options.snapEnabled
                    && target.options.snap.actions.indexOf(prepared) !== -1
                    && (!target.options.snap.endOnly || preEnd)) {

                    setSnapping(snapEvent);

                    // move if snapping doesn't prevent it or a restriction is in place
                    if ((snapStatus.changed || !snapStatus.locked) || shouldRestrict) {

                        if (shouldRestrict) {
                            setRestriction(event);
                        }

                        actions[prepared].moveListener(event);
                    }
                }
                // if no snap, always move
                else {
                    if (shouldRestrict) {
                        setRestriction(event);
                    }

                    actions[prepared].moveListener(event);
                }
            }
        }

        if (!(event instanceof InteractEvent)) {
            // set pointer coordinate, time changes and speeds
            setEventDeltas(pointerDelta, prevCoords, curCoords);
            setEventXY(prevCoords, event);
        }

        if (dragging || resizing) {
            autoScroll.edgeMove(event);
        }
    }

    function addPointer (event, gesture) {
        // dont add the event if it's not the same pointer type as the previous event
        if (pointerIds.length && pointerMoves[0].pointerType !== event.pointerType) {
            return;
        }

        if (gesture) {
            gesture.addPointer(event.pointerId);
        }

        var index = pointerIds.indexOf(event.pointerId);

        if (index === -1) {
            pointerIds.push(event.pointerId);

            // move events are kept so that multi-touch properties can still be
            // calculated at the end of a gesture; use pointerIds index
            pointerMoves[pointerIds.length - 1] = event;
        }
        else {
            pointerMoves[index] = event;
        }
    }

    function removePointer (event) {
        var index = pointerIds.indexOf(event.pointerId);

        if (index === -1) { return; }

        pointerIds.splice(index, 1);

        // move events are kept so that multi-touch properties can still be
        // calculated at the end of a GestureEvnt sequence
        //pointerMoves.splice(index, 1);
    }

    function recordPointers (event) {
        var index = pointerIds.indexOf(event.pointerId);

        if (index === -1) { return; }

        if (/move/i.test(event.type)) {
            pointerMoves[index] = event;
        }
        else if (/up|cancel/i.test(event.type)) {
            removePointer(event);

            // End the gesture InteractEvent if there are
            // fewer than 2 active pointers
            if (gesturing && pointerIds.length < 2) {
                target._gesture.stop();
            }
        }
    }

    function dragMove (event) {
        event.preventDefault();

        var dragEvent,
            dragEnterEvent,
            dragLeaveEvent,
            dropTarget,
            leaveDropTarget;

        if (!dragging) {
            dragEvent = new InteractEvent(downEvent, 'drag', 'start');
            dragging = true;

            target.fire(dragEvent);

            if (!dynamicDrop) {
                calcRects(dropzones);
                for (var i = 0; i < selectorDZs.length; i++) {
                    var interactable = selectorDZs[i],
                        context = interactable._context;

                    interactable._elements = context.querySelectorAll(interactable.selector);
                }
            }

            prevEvent = dragEvent;

            // set snapping for the next move event
            if (target.options.snapEnabled && !target.options.snap.endOnly) {
                setSnapping(event);
            }
        }

        dragEvent  = new InteractEvent(event, 'drag', 'move');

        var draggableElement = target._element,
            drop = getDrop(dragEvent, draggableElement);

        if (drop) {
            dropTarget = drop.dropzone;
            dropElement = drop.element;
        }
        else {
            dropTarget = dropElement = null;
        }

        // Make sure that the target selector draggable's element is
        // restored after dropChecks
        target._element = draggableElement;

        if (dropElement !== prevDropElement) {
            // if there was a prevDropTarget, create a dragleave event
            if (prevDropTarget) {
                dragLeaveEvent = new InteractEvent(event, 'drag', 'leave', prevDropElement, draggableElement);

                dragEvent.dragLeave = prevDropElement;
                leaveDropTarget = prevDropTarget;
                prevDropTarget = prevDropElement = null;
            }
            // if the dropTarget is not null, create a dragenter event
            if (dropTarget) {
                dragEnterEvent      = new InteractEvent(event, 'drag', 'enter', dropElement, draggableElement);

                dragEvent.dragEnter = dropTarget._element;
                prevDropTarget      = dropTarget;
                prevDropElement     = prevDropTarget._element;
            }
        }

        target.fire(dragEvent);

        if (dragLeaveEvent) {
            leaveDropTarget.fire(dragLeaveEvent);
        }
        if (dragEnterEvent) {
            dropTarget.fire(dragEnterEvent);
        }

        prevEvent = dragEvent;
    }

    function resizeMove (event) {
        event.preventDefault();

        var resizeEvent;

        if (!resizing) {
            resizeEvent = new InteractEvent(downEvent, 'resize', 'start');
            target.fire(resizeEvent);

            target.fire(resizeEvent);
            resizing = true;

            prevEvent = resizeEvent;

            // set snapping for the next move event
            if (target.options.snapEnabled && !target.options.snap.endOnly) {
                setSnapping(event);
            }
        }

        resizeEvent = new InteractEvent(event, 'resize', 'move');
        target.fire(resizeEvent);

        prevEvent = resizeEvent;
    }

    function gestureMove (event) {
        if ((!event.touches || event.touches.length < 2) && !PointerEvent) {
            return;
        }

        event.preventDefault();

        var gestureEvent;

        if (!gesturing) {
            gestureEvent = new InteractEvent(downEvent, 'gesture', 'start');
            gestureEvent.ds = 0;

            gesture.startDistance = gesture.prevDistance = gestureEvent.distance;
            gesture.startAngle = gesture.prevAngle = gestureEvent.angle;
            gesture.scale = 1;

            gesturing = true;

            target.fire(gestureEvent);

            prevEvent = gestureEvent;

            // set snapping for the next move event
            if (target.options.snapEnabled && !target.options.snap.endOnly) {
                setSnapping(event);
            }
        }

        gestureEvent = new InteractEvent(event, 'gesture', 'move');
        gestureEvent.ds = gestureEvent.scale - gesture.scale;

        target.fire(gestureEvent);

        prevEvent = gestureEvent;

        gesture.prevAngle = gestureEvent.angle;
        gesture.prevDistance = gestureEvent.distance;

        if (gestureEvent.scale !== Infinity &&
            gestureEvent.scale !== null &&
            gestureEvent.scale !== undefined  &&
            !isNaN(gestureEvent.scale)) {

            gesture.scale = gestureEvent.scale;
        }
    }

    function validateSelector (event, matches) {
        for (var i = 0, len = matches.length; i < len; i++) {
            var match = matches[i],
                action = validateAction(match.getAction(event, match), match);

            if (action) {
                target = match;

                return action;
            }
        }
    }

    function pointerOver (event) {
        if (pointerIsDown || dragging || resizing || gesturing) { return; }

        var curMatches = [],
            prevTargetElement = target && target._element,
            eventTarget = (event.target instanceof SVGElementInstance
                ? event.target.correspondingUseElement
                : event.target);

        if (target && testIgnore(target, eventTarget)) {
            // if the eventTarget should be ignored clear the previous target
            target = null;
            matches = [];
        }

        var elementInteractable = interactables.get(eventTarget),
            elementAction = elementInteractable && !testIgnore(elementInteractable, eventTarget)
                     && validateAction(
                         elementInteractable.getAction(event),
                         elementInteractable);

        function pushCurMatches (interactable, selector) {
            if (interactable
                && inContext(interactable, eventTarget)
                && !testIgnore(interactable, eventTarget)
                && eventTarget[matchesSelector](selector)) {

                interactable._element = eventTarget;
                curMatches.push(interactable);
            }
        }

        if (elementAction) {
            target = elementInteractable;
            matches = [];
        }
        else {
            interactables.forEachSelector(pushCurMatches);

            if (validateSelector(event, curMatches)) {
                matches = curMatches;

                pointerHover(event, matches);
                events.addToElement(eventTarget, 'mousemove', pointerHover);
            }
            else if (target) {
                var prevTargetChildren = prevTargetElement.querySelectorAll('*');

                if (Array.prototype.indexOf.call(prevTargetChildren, eventTarget) !== -1) {

                    // reset the elements of the matches to the old target
                    for (var i = 0; i < matches.length; i++) {
                        matches[i]._element = prevTargetElement;
                    }

                    pointerHover(event, matches);
                    events.addToElement(target._element, 'mousemove', pointerHover);
                }
                else {
                    target = null;
                    matches = [];
                }
            }
        }
    }

    function pointerOut (event) {
        if (pointerIsDown || dragging || resizing || gesturing) { return; }

        // Remove temporary event listeners for selector Interactables
        var eventTarget = (event.target instanceof SVGElementInstance
            ? event.target.correspondingUseElement
            : event.target);

        if (!interactables.get(eventTarget)) {
            events.removeFromElement(eventTarget, pointerHover);
        }

        if (target && target.options.styleCursor && !(dragging || resizing || gesturing)) {
            document.documentElement.style.cursor = '';
        }
    }

    // Check what action would be performed on pointerMove target if a mouse
    // button were pressed and change the cursor accordingly
    function pointerHover (event, matches) {
        if (!(pointerIsDown || dragging || resizing || gesturing)) {

            var action;

            if (matches) {
                action = validateSelector(event, matches);
            }
            else if (target) {
                action = validateAction(target.getAction(event));
            }

            if (target && target.options.styleCursor) {
                if (action) {
                    document.documentElement.style.cursor = actions[action].cursor;
                }
                else {
                    document.documentElement.style.cursor = '';
                }
            }
        }
        else if (prepared) {
            event.preventDefault();
        }
    }

    // End interact move events and stop auto-scroll unless inertia is enabled
    function pointerUp (event) {
        // don't return if the event is an InteractEvent (in the case of inertia end)
        // or if the browser uses PointerEvents (event would always be a gestureend)
        if (!(event instanceof InteractEvent || PointerEvent)
            && pointerIsDown && downEvent
            && !(event instanceof downEvent.constructor)) {

            return;
        }

        if (event.touches && event.touches.length >= 2) {
            return;
        }

        // Stop native GestureEvent inertia
        if (GestureEvent && (event instanceof GestureEvent) && /inertiastart/i.test(event.type)) {
            event.gestureObject.stop();
            return;
        }

        var endEvent,
            inertiaOptions = target && target.options.inertia,
            prop;

        if (dragging || resizing || gesturing) {

            if (inertiaStatus.active) { return; }

            var deltaSource =target.options.deltaSource,
                pointerSpeed = pointerDelta[deltaSource + 'Speed'];

            // check if inertia should be started
            if (target.options.inertiaEnabled
                && prepared !== 'gesture'
                && inertiaOptions.actions.indexOf(prepared) !== -1
                && event !== inertiaStatus.startEvent
                && (new Date().getTime() - curCoords.timeStamp) < 50
                && pointerSpeed > inertiaOptions.minSpeed
                && pointerSpeed > inertiaOptions.endSpeed) {


                var lambda = inertiaOptions.resistance,
                    inertiaDur = -Math.log(inertiaOptions.endSpeed / pointerSpeed) / lambda,
                    startEvent;

                inertiaStatus.active = true;
                inertiaStatus.target = target;
                inertiaStatus.targetElement = target._element;

                if (events.useAttachEvent) {
                    // make a copy of the pointerdown event because IE8
                    // http://stackoverflow.com/a/3533725/2280888
                    for (prop in event) {
                        inertiaStatus.pointerUp[prop] = event[prop];
                    }
                }
                else {
                    inertiaStatus.pointerUp = event;
                }

                inertiaStatus.startEvent = startEvent = new InteractEvent(event, 'drag', 'inertiastart');

                inertiaStatus.vx0 = pointerDelta[deltaSource + 'VX'];
                inertiaStatus.vy0 = pointerDelta[deltaSource + 'VY'];
                inertiaStatus.v0 = pointerSpeed;
                inertiaStatus.x0 = prevEvent.pageX;
                inertiaStatus.y0 = prevEvent.pageY;
                inertiaStatus.t0 = inertiaStatus.startEvent.timeStamp / 1000;
                inertiaStatus.sx = inertiaStatus.sy = 0;

                inertiaStatus.modifiedXe = inertiaStatus.xe = (inertiaStatus.vx0 - inertiaDur) / lambda;
                inertiaStatus.modifiedYe = inertiaStatus.ye = (inertiaStatus.vy0 - inertiaDur) / lambda;
                inertiaStatus.te = inertiaDur;

                inertiaStatus.lambda_v0 = lambda / inertiaStatus.v0;
                inertiaStatus.one_ve_v0 = 1 - inertiaOptions.endSpeed / inertiaStatus.v0;

                var startX = startEvent.pageX,
                    startY = startEvent.pageY,
                    statusObject;

                if (startEvent.snap && startEvent.snap.locked) {
                    startX -= startEvent.snap.dx;
                    startY -= startEvent.snap.dy;
                }

                if (startEvent.restrict) {
                    startX -= startEvent.restrict.dx;
                    startY -= startEvent.restrict.dy;
                }

                statusObject = {
                    useStatusXY: true,
                    x: startX + inertiaStatus.xe,
                    y: startY + inertiaStatus.ye,
                    dx: 0,
                    dy: 0,
                    snap: null
                };

                statusObject.snap = statusObject;

                if (target.options.snapEnabled && target.options.snap.endOnly) {
                    var snap = setSnapping(event, statusObject);

                    if (snap.locked) {
                        inertiaStatus.modifiedXe += snap.dx;
                        inertiaStatus.modifiedYe += snap.dy;
                    }
                }

                if (target.options.restrictEnabled && target.options.restrict.endOnly) {
                    var restrict = setRestriction(event, statusObject);

                    inertiaStatus.modifiedXe += restrict.dx;
                    inertiaStatus.modifiedYe += restrict.dy;
                }

                cancelFrame(inertiaStatus.i);
                inertiaStatus.i = reqFrame(inertiaFrame);

                target.fire(inertiaStatus.startEvent);

                return;
            }

            if ((target.options.snapEnabled && target.options.snap.endOnly)
                || (target.options.restrictEnabled && target.options.restrict.endOnly)) {
                // fire a move event at the snapped coordinates
                pointerMove(event, true);
            }
        }

        if (dragging) {
            endEvent = new InteractEvent(event, 'drag', 'end');

            var dropEvent,
                draggableElement = target._element,
                drop = getDrop(endEvent, draggableElement);

            if (drop) {
                dropTarget = drop.dropzone;
                dropElement = drop.element;
            }
            else {
                dropTarget = null;
                dropElement = null;
            }

            // getDrop changes target._element
            target._element = draggableElement;

            // get the most apprpriate dropzone based on DOM depth and order
            if (dropTarget) {
                dropEvent = new InteractEvent(event, 'drop', null, dropElement, draggableElement);

                endEvent.dropzone = dropElement;
            }

            // if there was a prevDropTarget (perhaps if for some reason this
            // dragend happens without the mouse moving of the previous drop
            // target)
            else if (prevDropTarget) {
                var dragLeaveEvent = new InteractEvent(event, 'drag', 'leave', dropElement, draggableElement);

                prevDropTarget.fire(dragLeaveEvent, draggableElement);

                endEvent.dragLeave = prevDropElement;
            }

            target.fire(endEvent);

            if (dropEvent) {
                dropTarget.fire(dropEvent);
            }
        }
        else if (resizing) {
            endEvent = new InteractEvent(event, 'resize', 'end');
            target.fire(endEvent);
        }
        else if (gesturing) {
            endEvent = new InteractEvent(event, 'gesture', 'end');
            target.fire(endEvent);
        }

        interact.stop();
    }

    // bound to the interactable context when a DOM event
    // listener is added to a selector interactable
    function delegateListener (event, useCapture) {
        var fakeEvent = {},
            delegated = delegatedEvents[event.type],
            element = event.target;

        useCapture = useCapture? true: false;

        // duplicate the event so that currentTarget can be changed
        for (var prop in event) {
            fakeEvent[prop] = event[prop];
        }

        fakeEvent.originalEvent = event;
        fakeEvent.preventDefault = preventOriginalDefault;

        // climb up document tree looking for selector matches
        while (element && element !== document) {
            for (var i = 0; i < delegated.selectors.length; i++) {
                var selector = delegated.selectors[i],
                    context = delegated.contexts[i];

                if (element[matchesSelector](selector)
                    && context === event.currentTarget
                    && nodeContains(context, element)) {

                    var listeners = delegated.listeners[i];

                    fakeEvent.currentTarget = element;

                    for (var j = 0; j < listeners.length; j++) {
                        if (listeners[j][1] !== useCapture) { continue; }

                        try {
                            listeners[j][0](fakeEvent);
                        }
                        catch (error) {
                            console.error('Error thrown from delegated listener: ' +
                                          '"' + selector + '" ' + event.type + ' ' +
                                          (listeners[j][0].name? listeners[j][0].name: ''));
                            console.log(error);
                        }
                    }
                }
            }

            element = element.parentNode;
        }
    }

    function delegateUseCapture (event) {
        return delegateListener.call(this, event, true);
    }

    interactables.indexOfElement = dropzones.indexOfElement = function indexOfElement (element, context) {
        for (var i = 0; i < this.length; i++) {
            var interactable = this[i];

            if ((interactable.selector === element
                && (interactable._context === (context || document)))

                || (!interactable.selector && interactable._element === element)) {

                return i;
            }
        }
        return -1;
    };

    interactables.get = dropzones.get = function interactableGet (element, options) {
        return this[this.indexOfElement(element, options && options.context)];
    };

    interactables.forEachSelector = function (callback) {
        for (var i = 0; i < this.length; i++) {
            var interactable = this[i];

            if (!interactable.selector) {
                continue;
            }

            if (callback(interactable, interactable.selector, interactable._context, i, this)
                    === false) {
                return;
            }
        }
    };

    function clearTargets () {
        if (target && !target.selector) {
            target = null;
        }

        dropTarget = dropElement = prevDropTarget = prevDropElement = null;
    }

    /*\
     * interact
     [ method ]
     *
     * The methods of this variable can be used to set elements as
     * interactables and also to change various default settings.
     *
     * Calling it as a function and passing an element or a valid CSS selector
     * string returns an Interactable object which has various methods to
     * configure it.
     *
     - element (Element | string) The HTML or SVG Element to interact with or CSS selector
     = (object) An @Interactable
     *
     > Usage
     | interact(document.getElementById('draggable')).draggable(true);
     |
     | var rectables = interact('rect');
     | rectables
     |     .gesturable(true)
     |     .on('gesturemove', function (event) {
     |         // something cool...
     |     })
     |     .autoScroll(true);
    \*/
    function interact (element, options) {
        return interactables.get(element, options) || new Interactable(element, options);
    }

    // A class for easy inheritance and setting of an Interactable's options
    function IOptions (options) {
        for (var option in defaultOptions) {
            if (options.hasOwnProperty(option)
                && typeof options[option] === typeof defaultOptions[option]) {
                this[option] = options[option];
            }
        }
    }

    IOptions.prototype = defaultOptions;

    /*\
     * Interactable
     [ property ]
     **
     * Object type returned by @interact
    \*/
    function Interactable (element, options) {
        this._element = element;
        this._iEvents = this._iEvents || {};

        if (typeof element === 'string') {
            // if the selector is invalid,
            // an exception will be raised
            document.querySelector(element);

            this.selector = element;
            this._gesture = selectorGesture;

            if (options && options.context
                && (window.Node
                    ? options.context instanceof window.Node
                    : (isElement(options.context) || options.context === document))) {
                this._context = options.context;
            }
        }
        else if (isElement(element)) {
            if (PointerEvent) {
                events.add(this, 'pointerdown', pointerDown );
                events.add(this, 'pointermove', pointerHover);

                this._gesture = new Gesture();
                this._gesture.target = element;
            }
            else {
                events.add(this, 'mousedown' , pointerDown );
                events.add(this, 'mousemove' , pointerHover);
                events.add(this, 'touchstart', pointerDown );
                events.add(this, 'touchmove' , pointerHover);
            }
        }

        interactables.push(this);

        this.set(options);
    }

    Interactable.prototype = {
        setOnEvents: function (action, phases) {
            if (action === 'drop') {
                var drop      = phases.ondrop      || phases.onDrop      || phases.drop,
                    dragenter = phases.ondragenter || phases.onDropEnter || phases.dragenter,
                    dragleave = phases.ondragleave || phases.onDropLeave || phases.dragleave;

                if (typeof drop      === 'function') { this.ondrop      = drop     ; }
                if (typeof dragenter === 'function') { this.ondragenter = dragenter; }
                if (typeof dragleave === 'function') { this.ondragleave = dragleave; }
            }
            else {
                var start     = phases.onstart     || phases.onStart     || phases.start,
                    move      = phases.onmove      || phases.onMove      || phases.move,
                    end       = phases.onend       || phases.onEnd       || phases.end;

                var inertiastart = phases.oninertiastart || phases.onInertiaStart || phases.inertiastart;

                action = 'on' + action;

                if (typeof start === 'function') { this[action + 'start'] = start; }
                if (typeof move  === 'function') { this[action + 'move' ] = move ; }
                if (typeof end   === 'function') { this[action + 'end'  ] = end  ; }

                if (typeof inertiastart === 'function') { this[action + 'inertiastart'  ] = inertiastart  ; }
            }

            return this;
        },

        /*\
         * Interactable.draggable
         [ method ]
         *
         * Gets or sets whether drag actions can be performed on the
         * Interactable
         *
         = (boolean) Indicates if this can be the target of drag events
         | var isDraggable = interact('ul li').draggable();
         * or
         - options (boolean | object) #optional true/false or An object with event listeners to be fired on drag events (object makes the Interactable draggable)
         = (object) This Interactable
         | interact(element).draggable({
         |     onstart: function (event) {},
         |     onmove : function (event) {},
         |     onend  : function (event) {}
         | });
        \*/
        draggable: function (options) {
            if (options instanceof Object) {
                this.options.draggable = true;
                this.setOnEvents('drag', options);

                return this;
            }

            if (typeof options === 'boolean') {
                this.options.draggable = options;

                return this;
            }

            if (options === null) {
                delete this.options.draggable;

                return this;
            }

            return this.options.draggable;
        },

        /*\
         * Interactable.dropzone
         [ method ]
         *
         * Returns or sets whether elements can be dropped onto this
         * Interactable to trigger drop events
         *
         - options (boolean | object | null) #optional The new value to be set.
         = (boolean | object) The current setting or this Interactable
        \*/
        dropzone: function (options) {
            if (options instanceof Object) {
                this.options.dropzone = true;
                this.setOnEvents('drop', options);
                this.accept(options.accept);

                (this.selector? selectorDZs: dropzones).push(this);

                if (!dynamicDrop && !this.selector) {
                    this.rect = this.getRect();
                }
                return this;
            }

            if (typeof options === 'boolean') {
                if (options) {
                    (this.selector? selectorDZs: dropzones).push(this);

                    if (!dynamicDrop && !this.selector) {
                        this.rect = this.getRect();
                    }
                }
                else {
                    var array = this.selector? selectorDZs: dropzones,
                        index = array.indexOf(this);
                    if (index !== -1) {
                        array.splice(index, 1);
                    }
                }

                this.options.dropzone = options;

                return this;
            }

            if (options === null) {
                delete this.options.dropzone;

                return this;
            }

            return this.options.dropzone;
        },

        /*\
         * Interactable.dropCheck
         [ method ]
         *
         * The default function to determine if a dragend event occured over
         * this Interactable's element. Can be overridden using
         * @Interactable.dropChecker.
         *
         - event (MouseEvent | TouchEvent) The event that ends a drag
         = (boolean) whether the pointer was over this Interactable
        \*/
        dropCheck: function (event, draggable, element) {
            var page = getPageXY(event),
                origin = getOriginXY(draggable, element),
                horizontal,
                vertical;

            page.x += origin.x;
            page.y += origin.y;

            if (dynamicDrop) {
                this.rect = this.getRect();
            }

            if (!this.rect) {
                return false;
            }

            horizontal = (page.x > this.rect.left) && (page.x < this.rect.right);
            vertical   = (page.y > this.rect.top ) && (page.y < this.rect.bottom);

            return horizontal && vertical;
        },

        /*\
         * Interactable.dropChecker
         [ method ]
         *
         * Gets or sets the function used to check if a dragged element is
         * over this Interactable. See @Interactable.dropCheck.
         *
         - checker (function) #optional
         * The checker is a function which takes a mouseUp/touchEnd event as a
         * parameter and returns true or false to indicate if the the current
         * draggable can be dropped into this Interactable
         *
         = (Function | Interactable) The checker function or this Interactable
        \*/
        dropChecker: function (newValue) {
            if (typeof newValue === 'function') {
                this.dropCheck = newValue;

                return this;
            }
            return this.dropCheck;
        },

        /*\
         * Interactable.accept
         [ method ]
         *
         * Gets or sets the Element or CSS selector match that this
         * Interactable accepts if it is a dropzone.
         *
         - newValue (Element | string | null) #optional
         * If it is an Element, then only that element can be dropped into this dropzone.
         * If it is a string, the element being dragged must match it as a selector.
         * If it is null, the accept options is cleared - it accepts any element.
         *
         = (string | Element | null | Interactable) The current accept option if given `undefined` or this Interactable
        \*/
        accept: function (newValue) {
            if (isElement(newValue)) {
                this.options.accept = newValue;

                return this;
            }

            if (typeof newValue === 'string') {
                // test if it is a valid CSS selector
                document.querySelector(newValue);
                this.options.accept = newValue;

                return this;
            }

            if (newValue === null) {
                delete this.options.accept;

                return this;
            }

            return this.options.accept;
        },

        /*\
         * Interactable.resizable
         [ method ]
         *
         * Gets or sets whether resize actions can be performed on the
         * Interactable
         *
         = (boolean) Indicates if this can be the target of resize elements
         | var isResizeable = interact('input[type=text]').resizable();
         * or
         - options (boolean | object) #optional true/false or An object with event listeners to be fired on resize events (object makes the Interactable resizable)
         = (object) This Interactable
         | interact(element).resizable({
         |     onstart: function (event) {},
         |     onmove : function (event) {},
         |     onend  : function (event) {},
         |
         |     axis   : 'x' || 'y' || 'xy' // default is 'xy'
         | });
        \*/
        resizable: function (options) {
            if (options instanceof Object) {
                this.options.resizable = true;
                this.setOnEvents('resize', options);

                if (/^x$|^y$|^xy$/.test(options.axis)) {
                    this.options.resizeAxis = options.axis;
                }
                else if (options.axis === null) {
                    this.options.resizeAxis = defaultOptions.resizeAxis;
                }

                return this;
            }
            if (typeof options === 'boolean') {
                this.options.resizable = options;

                return this;
            }
            return this.options.resizable;
        },

        // misspelled alias
        resizeable: blank,

        /*\
         * Interactable.squareResize
         [ method ]
         *
         * Gets or sets whether resizing is forced 1:1 aspect
         *
         = (boolean) Current setting
         *
         * or
         *
         - newValue (boolean) #optional
         = (object) this Interactable
        \*/
        squareResize: function (newValue) {
            if (typeof newValue === 'boolean') {
                this.options.squareResize = newValue;

                return this;
            }

            if (newValue === null) {
                delete this.options.squareResize;

                return this;
            }

            return this.options.squareResize;
        },

        /*\
         * Interactable.gesturable
         [ method ]
         *
         * Gets or sets whether multitouch gestures can be performed on the
         * Interactable's element
         *
         = (boolean) Indicates if this can be the target of gesture events
         | var isGestureable = interact(element).gesturable();
         * or
         - options (boolean | object) #optional true/false or An object with event listeners to be fired on gesture events (makes the Interactable gesturable)
         = (object) this Interactable
         | interact(element).gesturable({
         |     onmove: function (event) {}
         | });
        \*/
        gesturable: function (options) {
            if (options instanceof Object) {
                this.options.gesturable = true;
                this.setOnEvents('gesture', options);

                return this;
            }

            if (typeof options === 'boolean') {
                this.options.gesturable = options;

                return this;
            }

            if (options === null) {
                delete this.options.gesturable;

                return this;
            }

            return this.options.gesturable;
        },

        // misspelled alias
        gestureable: blank,

        /*\
         * Interactable.autoScroll
         [ method ]
         *
         * Returns or sets whether or not any actions near the edges of the
         * window/container trigger autoScroll for this Interactable
         *
         = (boolean | object)
         * `false` if autoScroll is disabled; object with autoScroll properties
         * if autoScroll is enabled
         *
         * or
         *
         - options (object | boolean | null) #optional
         * options can be:
         * - an object with margin, distance and interval properties,
         * - true or false to enable or disable autoScroll or
         * - null to use default settings
         = (Interactable) this Interactable
        \*/
        autoScroll: function (options) {
            var defaults = defaultOptions.autoScroll;

            if (options instanceof Object) {
                var autoScroll = this.options.autoScroll;

                if (autoScroll === defaults) {
                   autoScroll = this.options.autoScroll = {
                       margin   : defaults.margin,
                       distance : defaults.distance,
                       interval : defaults.interval,
                       container: defaults.container
                   };
                }

                autoScroll.margin = this.validateSetting('autoScroll', 'margin', options.margin);
                autoScroll.speed  = this.validateSetting('autoScroll', 'speed' , options.speed);

                autoScroll.container =
                    (isElement(options.container) || options.container instanceof window.Window
                     ? options.container
                     : defaults.container);


                this.options.autoScrollEnabled = true;
                this.options.autoScroll = autoScroll;

                return this;
            }

            if (typeof options === 'boolean') {
                this.options.autoScrollEnabled = options;

                return this;
            }

            if (options === null) {
                delete this.options.autoScrollEnabled;
                delete this.options.autoScroll;

                return this;
            }

            return (this.options.autoScrollEnabled
                ? this.options.autoScroll
                : false);
        },

        /*\
         * Interactable.snap
         [ method ]
         **
         * Returns or sets if and how action coordinates are snapped
         **
         = (boolean | object) `false` if snap is disabled; object with snap properties if snap is enabled
         **
         * or
         **
         - options (object | boolean | null) #optional
         = (Interactable) this Interactable
         > Usage
         | interact('.handle').snap({
         |     mode        : 'grid',                // event coords should snap to the corners of a grid
         |     range       : Infinity,              // the effective distance of snap ponts
         |     grid        : { x: 100, y: 100 },    // the x and y spacing of the grid points
         |     gridOffset  : { x:   0, y:   0 },    // the offset of the grid points
         | });
         |
         | interact('.handle').snap({
         |     mode        : 'anchor',              // snap to specified points
         |     anchors     : [
         |         { x: 100, y: 100, range: 25 },   // a point with x, y and a specific range
         |         { x: 200, y: 200 }               // a point with x and y. it uses the default range
         |     ]
         | });
         |
         | interact(document.querySelector('#thing')).snap({
         |     mode : 'path',
         |     paths: [
         |         {            // snap to points on these x and y axes
         |             x: 100,
         |             y: 100,
         |             range: 25
         |         },
         |         // give this function the x and y page coords and snap to the object returned
         |         function (x, y) {
         |             return {
         |                 x: x,
         |                 y: (75 + 50 * Math.sin(x * 0.04)),
         |                 range: 40
         |             };
         |         }]
         | })
         |
         | interact(element).snap({
         |     // do not snap during normal movement.
         |     // Instead, trigger only one snapped move event
         |     // immediately before the end event.
         |     endOnly: true
         | });
        \*/
        snap: function (options) {
            var defaults = defaultOptions.snap;

            if (options instanceof Object) {
                var snap = this.options.snap;

                if (snap === defaults) {
                   snap = {};
                }

                snap.mode       = this.validateSetting('snap', 'mode'      , options.mode);
                snap.endOnly    = this.validateSetting('snap', 'endOnly'   , options.endOnly);
                snap.actions    = this.validateSetting('snap', 'actions'   , options.actions);
                snap.range      = this.validateSetting('snap', 'range'     , options.range);
                snap.paths      = this.validateSetting('snap', 'paths'     , options.paths);
                snap.grid       = this.validateSetting('snap', 'grid'      , options.grid);
                snap.gridOffset = this.validateSetting('snap', 'gridOffset', options.gridOffset);
                snap.anchors    = this.validateSetting('snap', 'anchors'   , options.anchors);

                this.options.snapEnabled = true;
                this.options.snap = snap;

                return this;
            }

            if (typeof options === 'boolean') {
                this.options.snapEnabled = options;

                return this;
            }

            if (options === null) {
                delete this.options.snapEnabled;
                delete this.options.snap;

                return this;
            }

            return (this.options.snapEnabled
                ? this.options.snap
                : false);
        },

        /*\
         * Interactable.inertia
         [ method ]
         **
         * Returns or sets if and how events continue to run after the pointer is released
         **
         = (boolean | object) `false` if inertia is disabled; `object` with inertia properties if inertia is enabled
         **
         * or
         **
         - options (object | boolean | null) #optional
         = (Interactable) this Interactable
         > Usage
         | // enable and use default settings
         | interact(element).inertia(true);
         |
         | // enable and use custom settings
         | interact(element).inertia({
         |     // value greater than 0
         |     // high values slow the object down more quickly
         |     resistance     : 16,
         |
         |     // the minimum launch speed (pixels per second) that results in inertiastart
         |     minSpeed       : 200,
         |
         |     // inertia will stop when the object slows down to this speed
         |     endSpeed       : 20,
         |
         |     // an array of action types that can have inertia (no gesture)
         |     actions        : ['drag', 'resize'],
         |
         |     // boolean; should the jump when resuming from inertia be ignored in event.dx/dy
         |     zeroResumeDelta: false
         | });
         |
         | // reset custom settings and use all defaults
         | interact(element).inertia(null);
        \*/
        inertia: function (options) {
            var defaults = defaultOptions.inertia;

            if (options instanceof Object) {
                var inertia = this.options.inertia;

                if (inertia === defaults) {
                   inertia = this.options.inertia = {
                       resistance     : defaults.resistance,
                       minSpeed       : defaults.minSpeed,
                       endSpeed       : defaults.endSpeed,
                       actions        : defaults.actions,
                       zeroResumeDelta: defaults.zeroResumeDelta
                   };
                }

                inertia.resistance      = this.validateSetting('inertia', 'resistance'     , options.resistance);
                inertia.minSpeed        = this.validateSetting('inertia', 'minSpeed'       , options.minSpeed);
                inertia.endSpeed        = this.validateSetting('inertia', 'endSpeed'       , options.endSpeed);
                inertia.actions         = this.validateSetting('inertia', 'actions'        , options.actions);
                inertia.zeroResumeDelta = this.validateSetting('inertia', 'zeroResumeDelta', options.zeroResumeDelta);

                this.options.inertiaEnabled = true;
                this.options.inertia = inertia;

                return this;
            }

            if (typeof options === 'boolean') {
                this.options.inertiaEnabled = options;

                return this;
            }

            if (options === null) {
                delete this.options.inertiaEnabled;
                delete this.options.inertia;

                return this;
            }

            return (this.options.inertiaEnabled
                ? this.options.inertia
                : false);
        },

        getAction: function (event) {
            var action = this.defaultActionChecker(event);

            if (this.options.actionChecker) {
                action = this.options.actionChecker(event, action, this);
            }

            return action;
        },

        defaultActionChecker: defaultActionChecker,

        /*\
         * Interactable.actionChecker
         [ method ]
         *
         * Gets or sets the function used to check action to be performed on
         * pointerDown
         *
         - checker (function | null) #optional A function which takes a pointer event, defaultAction string and an interactable as parameters and returns 'drag' 'resize[axes]' or 'gesture' or null.
         = (Function | Interactable) The checker function or this Interactable
        \*/
        actionChecker: function (newValue) {
            if (typeof newValue === 'function') {
                this.options.actionChecker = newValue;

                return this;
            }

            if (newValue === null) {
                delete this.options.actionChecker;

                return this;
            }

            return this.options.actionChecker;
        },

        /*\
         * Interactable.getRect
         [ method ]
         *
         * The default function to get an Interactables bounding rect. Can be
         * overridden using @Interactable.rectChecker.
         *
         = (object) The object's bounding rectangle. The properties are numbers with no units.
         o {
         o     top: -,
         o     left: -,
         o     bottom: -,
         o     right: -,
         o     width: -,
         o     height: -
         o }
        \*/
        getRect: function rectCheck () {
            if (this.selector && !(isElement(this._element))) {
                this._element = this._context.querySelector(this.selector);
            }

            return getElementRect(this._element);
        },

        /*\
         * Interactable.rectChecker
         [ method ]
         *
         * Returns or sets the function used to calculate the interactable's
         * element's rectangle
         *
         - checker (function) #optional A function which returns this Interactable's bounding rectangle. See @Interactable.getRect
         = (function | object) The checker function or this Interactable
        \*/
        rectChecker: function (newValue) {
            if (typeof newValue === 'function') {
                this.getRect = newValue;

                return this;
            }

            if (newValue === null) {
                delete this.options.getRect;

                return this;
            }

            return this.getRect;
        },

        /*\
         * Interactable.styleCursor
         [ method ]
         *
         * Returns or sets whether the action that would be performed when the
         * mouse on the element are checked on `mousemove` so that the cursor
         * may be styled appropriately
         *
         - newValue (function) #optional
         = (Function | Interactable) The current setting or this Interactable
        \*/
        styleCursor: function (newValue) {
            if (typeof newValue === 'boolean') {
                this.options.styleCursor = newValue;

                return this;
            }

            if (newValue === null) {
                delete this.options.styleCursor;

                return this;
            }

            return this.options.styleCursor;
        },

        /*\
         * Interactable.origin
         [ method ]
         *
         * Gets or sets the origin of the Interactable's element.  The x and y
         * of the origin will be subtracted from action event coordinates.
         *
         - origin (object) #optional An object with x and y properties which are numbers
         * OR
         - origin (Element) #optional An HTML or SVG Element whose rect will be used
         **
         = (object) The current origin or this Interactable
        \*/
        origin: function (newValue) {
            if (newValue instanceof Object || /^parent$|^self$/.test(newValue)) {
                this.options.origin = newValue;

                return this;
            }

            if (newValue === null) {
                delete this.options.origin;

                return this;
            }

            return this.options.origin;
        },

        /*\
         * Interactable.deltaSource
         [ method ]
         *
         * Returns or sets the mouse coordinate types used to calculate the
         * movement of the pointer.
         *
         - source (string) #optional Use 'client' if you will be scrolling while interacting; Use 'page' if you want autoScroll to work
         = (string | object) The current deltaSource or this Interactable
        \*/
        deltaSource: function (newValue) {
            if (newValue === 'page' || newValue === 'client') {
                this.options.deltaSource = newValue;

                return this;
            }

            if (newValue === null) {
                delete this.options.deltaSource;

                return this;
            }

            return this.options.deltaSource;
        },

        /*\
         * Interactable.restrict
         [ method ]
         *
         * Returns or sets the rectangles within which actions on this
         * interactable (after snap calculations) are restricted.
         *
         - newValue (object) #optional an object with keys drag, resize, and/or gesture and rects or Elements as values
         = (object) The current restrictions object or this Interactable
         **
         | interact(element).restrict({
         |     // the rect will be `interact.getElementRect(element.parentNode)`
         |     drag: element.parentNode,
         |
         |     // x and y are relative to the the interactable's origin
         |     resize: { x: 100, y: 100, width: 200, height: 200 }
         | })
         |
         | interact('.draggable').restrict({
         |     // the rect will be the selected element's parent
         |     drag: 'parent',
         |
         |     // do not restrict during normal movement.
         |     // Instead, trigger only one restricted move event
         |     // immediately before the end event.
         |     endOnly: true
         | });
        \*/
        restrict: function (newValue) {
            if (newValue === undefined) {
                return this.options.restrict;
            }

            if (newValue instanceof Object) {
                var newRestrictions = {};

                if (newValue.drag instanceof Object || /^parent$|^self$/.test(newValue.drag)) {
                    newRestrictions.drag = newValue.drag;
                }
                if (newValue.resize instanceof Object || /^parent$|^self$/.test(newValue.resize)) {
                    newRestrictions.resize = newValue.resize;
                }
                if (newValue.gesture instanceof Object || /^parent$|^self$/.test(newValue.gesture)) {
                    newRestrictions.gesture = newValue.gesture;
                }

                if (typeof newValue.endOnly === 'boolean') {
                    newRestrictions.endOnly = newValue.endOnly;
                }

                this.options.restrictEnabled = true;
                this.options.restrict = newRestrictions;
            }

            else if (newValue === null) {
               delete this.options.restrict;
               delete this.options.restrictEnabled;
            }

            return this;
        },

        /*\
         * Interactable.context
         [ method ]
         *
         * Get's the selector context Node of the Interactable. The default is `window.document`.
         *
         = (Node) The context Node of this Interactable
         **
        \*/
        context: function () {
            return this._context;
        },

        _context: document,

        /*\
         * Interactable.ignoreFrom
         [ method ]
         *
         * If the target of the `mousedown`, `pointerdown` or `touchstart`
         * event or any of it's parents match the given CSS selector or
         * Element, no action is performed.
         *
         - newValue (string | Element) #optional a CSS selector string, an Element or `null` to not ignore any elements
         = (string | Element | object) The current ignoreFrom value or this Interactable
         **
         | interact(element, { ignoreFrom: document.getElementById('no-action') });
         | // or
         | interact(element).ignoreFrom('input, textarea, a');
        \*/
        ignoreFrom: function (newValue) {
            if (typeof newValue === 'string'            // CSS selector to match event.target
                || isElement(newValue)) {       // or a specific element

                this.options.ignoreFrom = newValue;

                return this;
            }
            else if (newValue === null) {
                delete this.options.ignoreFrom;

                return this;
            }

            return this.options.ignoreFrom;
        },

        /*\
         * Interactable.validateSetting
         [ method ]
         *
         - context (string) eg. 'snap', 'autoScroll'
         - option (string) The name of the value being set
         - value (any type) The value being validated
         *
         = (typeof value) A valid value for the give context-option pair
         * - null if defaultOptions[context][value] is undefined
         * - value if it is the same type as defaultOptions[context][value],
         * - this.options[context][value] if it is the same type as defaultOptions[context][value],
         * - or defaultOptions[context][value]
        \*/
        validateSetting: function (context, option, value) {
            var defaults = defaultOptions[context],
                current = this.options[context];

            if (defaults !== undefined && defaults[option] !== undefined) {
                if ('objectTypes' in defaults && defaults.objectTypes.test(option)) {
                    if (value instanceof Object) { return value; }
                    else {
                        return (option in current && current[option] instanceof Object
                            ? current [option]
                            : defaults[option]);
                    }
                }

                if ('arrayTypes' in defaults && defaults.arrayTypes.test(option)) {
                    if (value instanceof Array) { return value; }
                    else {
                        return (option in current && current[option] instanceof Array
                            ? current[option]
                            : defaults[option]);
                    }
                }

                if ('stringTypes' in defaults && defaults.stringTypes.test(option)) {
                    if (typeof value === 'string') { return value; }
                    else {
                        return (option in current && typeof current[option] === 'string'
                            ? current[option]
                            : defaults[option]);
                    }
                }

                if ('numberTypes' in defaults && defaults.numberTypes.test(option)) {
                    if (typeof value === 'number') { return value; }
                    else {
                        return (option in current && typeof current[option] === 'number'
                            ? current[option]
                            : defaults[option]);
                    }
                }

                if ('boolTypes' in defaults && defaults.boolTypes.test(option)) {
                    if (typeof value === 'boolean') { return value; }
                    else {
                        return (option in current && typeof current[option] === 'boolean'
                            ? current[option]
                            : defaults[option]);
                    }
                }

                if ('elementTypes' in defaults && defaults.elementTypes.test(option)) {
                    if (isElement(value)) { return value; }
                    else {
                        return (option in current && isElement(current[option])
                            ? current[option]
                            : defaults[option]);
                    }
                }
            }

            return null;
        },

        /*\
         * Interactable.element
         [ method ]
         *
         * If this is not a selector Interactable, it returns the element this
         * interactable represents
         *
         = (Element) HTML / SVG Element
        \*/
        element: function () {
            return this._element;
        },

        /*\
         * Interactable.fire
         [ method ]
         *
         * Calls listeners for the given InteractEvent type bound globablly
         * and directly to this Interactable
         *
         - iEvent (InteractEvent) The InteractEvent object to be fired on this Interactable
         = (Interactable) this Interactable
        \*/
        fire: function (iEvent) {
            if (!(iEvent && iEvent.type) || eventTypes.indexOf(iEvent.type) === -1) {
                return this;
            }

            var listeners,
                fireState = 0,
                i = 0,
                len,
                onEvent = 'on' + iEvent.type;

            // Try-catch and loop so an exception thrown from a listener
            // doesn't ruin everything for everyone
            while (fireState < 3) {
                try {
                    switch (fireState) {
                        // Interactable#on() listeners
                        case fireStates.directBind:
                            if (iEvent.type in this._iEvents) {
                            listeners = this._iEvents[iEvent.type];

                            for (len = listeners.length; i < len && !iEvent.immediatePropagationStopped; i++) {
                                listeners[i](iEvent);
                            }
                            break;
                        }

                        break;

                        // interactable.onevent listener
                        case fireStates.onevent:
                            if (typeof this[onEvent] === 'function') {
                            this[onEvent](iEvent);
                        }
                        break;

                        // interact.on() listeners
                        case fireStates.globalBind:
                            if (iEvent.type in globalEvents && (listeners = globalEvents[iEvent.type]))  {

                            for (len = listeners.length; i < len && !iEvent.immediatePropagationStopped; i++) {
                                listeners[i](iEvent);
                            }
                        }
                    }

                    if (iEvent.propagationStopped) {
                        break;
                    }

                    i = 0;
                    fireState++;
                }
                catch (error) {
                    console.error('Error thrown from ' + iEvent.type + ' listener');
                    console.error(error);
                    i++;

                    if (fireState === fireStates.onevent) {
                        fireState++;
                    }
                }
            }

            return this;
        },

        /*\
         * Interactable.on
         [ method ]
         *
         * Binds a listener for an InteractEvent or DOM event.
         *
         - eventType  (string)   The type of event to listen for
         - listener   (function) The function to be called on that event
         - useCapture (boolean) #optional useCapture flag for addEventListener
         = (object) This Interactable
        \*/
        on: function (eventType, listener, useCapture) {
            if (eventType === 'wheel') {
                eventType = wheelEvent;
            }

            // convert to boolean
            useCapture = useCapture? true: false;

            if (eventTypes.indexOf(eventType) !== -1) {
                // if this type of event was never bound to this Interactable
                if (!(eventType in this._iEvents)) {
                    this._iEvents[eventType] = [listener];
                }
                // if the event listener is not already bound for this type
                else if (this._iEvents[eventType].indexOf(listener) === -1) {
                    this._iEvents[eventType].push(listener);
                }
            }
            // delegated event for selector
            else if (this.selector) {
                if (!delegatedEvents[eventType]) {
                    delegatedEvents[eventType] = {
                        selectors: [],
                        contexts : [],
                        listeners: []
                    };

                    // add delegate listener functions
                    events.addToElement(this._context, eventType, delegateListener);
                    events.addToElement(this._context, eventType, delegateUseCapture, true);
                }

                var delegated = delegatedEvents[eventType],
                    index;

                for (index = delegated.selectors.length - 1; index >= 0; index--) {
                    if (delegated.selectors[index] === this.selector
                        && delegated.contexts[index] === this._context) {
                        break;
                    }
                }

                if (index === -1) {
                    index = delegated.selectors.length;

                    delegated.selectors.push(this.selector);
                    delegated.contexts .push(this._context);
                    delegated.listeners.push([]);
                }

                // keep listener and useCapture flag
                delegated.listeners[index].push([listener, useCapture]);
            }
            else {
                events.add(this, eventType, listener, useCapture);
            }

            return this;
        },

        /*\
         * Interactable.off
         [ method ]
         *
         * Removes an InteractEvent or DOM event listener
         *
         - eventType  (string)   The type of event that was listened for
         - listener   (function) The listener function to be removed
         - useCapture (boolean) #optional useCapture flag for removeEventListener
         = (object) This Interactable
        \*/
        off: function (eventType, listener, useCapture) {
            var eventList,
                index = -1;

            // convert to boolean
            useCapture = useCapture? true: false;

            if (eventType === 'wheel') {
                eventType = wheelEvent;
            }

            // if it is an action event type
            if (eventTypes.indexOf(eventType) !== -1) {
                eventList = this._iEvents[eventType];

                if (eventList && (index = eventList.indexOf(listener)) !== -1) {
                    this._iEvents[eventType].splice(index, 1);
                }
            }
            // delegated event
            else if (this.selector) {
                var delegated = delegatedEvents[eventType],
                    matchFound = false;

                if (!delegated) { return this; }

                // count from last index of delegated to 0
                for (index = delegated.selectors.length - 1; index >= 0; index--) {
                    // look for matching selector and context Node
                    if (delegated.selectors[index] === this.selector
                        && delegated.contexts[index] === this._context) {

                        var listeners = delegated.listeners[index];

                        // each item of the listeners array is an array: [function, useCaptureFlag]
                        for (var i = listeners.length - 1; i >= 0; i--) {
                            var fn = listeners[i][0],
                                useCap = listeners[i][1];

                            // check if the listener functions and useCapture flags match
                            if (fn === listener && useCap === useCapture) {
                                // remove the listener from the array of listeners
                                listeners.splice(i, 1);

                                // if all listeners for this interactable have been removed
                                // remove the interactable from the delegated arrays
                                if (!listeners.length) {
                                    delegated.selectors.splice(index, 1);
                                    delegated.contexts .splice(index, 1);
                                    delegated.listeners.splice(index, 1);

                                    // remove delegate function from context
                                    events.removeFromElement(this._context, eventType, delegateListener);
                                    events.removeFromElement(this._context, eventType, delegateUseCapture, true);

                                    // remove the arrays if they are empty
                                    if (!delegated.selectors.length) {
                                        delegatedEvents[eventType] = null;
                                    }
                                }

                                // only remove one listener
                                matchFound = true;
                                break;
                            }
                        }

                        if (matchFound) { break; }
                    }
                }
            }
            // remove listener from this Interatable's element
            else {
                events.remove(this, listener, useCapture);
            }

            return this;
        },

        /*\
         * Interactable.set
         [ method ]
         *
         * Reset the options of this Interactable
         - options (object) The new settings to apply
         = (object) This Interactablw
        \*/
        set: function (options) {
            if (!options || typeof options !== 'object') {
                options = {};
            }
            this.options = new IOptions(options);

            this.draggable  ('draggable'   in options? options.draggable  : this.options.draggable  );
            this.dropzone   ('dropzone'    in options? options.dropzone   : this.options.dropzone   );
            this.resizable ('resizable'  in options? options.resizable : this.options.resizable );
            this.gesturable('gesturable' in options? options.gesturable: this.options.gesturable);

            var settings = [
                    'accept', 'actionChecker', 'autoScroll',
                    'dropChecker', 'ignoreFrom', 'inertia', 'origin',
                    'rectChecker', 'restrict', 'snap'
                ];

            for (var i = 0, len = settings.length; i < len; i++) {
                var setting = settings[i];

                if (setting in options) {
                    this[setting](options[setting]);
                }
            }

            return this;
        },

        /*\
         * Interactable.unset
         [ method ]
         *
         * Remove this interactable from the list of interactables and remove
         * it's drag, drop, resize and gesture capabilities
         *
         = (object) @interact
        \*/
        unset: function () {
            events.remove(this, 'all');

            if (typeof this.selector !== 'string') {
                events.remove(this, 'all');
                if (this.options.styleCursor) {
                    this._element.style.cursor = '';
                }

                if (this._gesture) {
                    this._gesture.target = null;
                }
            }
            else {
                // remove delegated events
                for (var type in delegatedEvents) {
                    var delegated = delegatedEvents[type];

                    for (var i = 0; i < delegated.selectors.length; i++) {
                        if (delegated.selectors[i] === this.selector
                            && delegated.contexts[i] === this._context) {

                            delegated.selectors.splice(i, 1);
                            delegated.contexts .splice(i, 1);
                            delegated.listeners.splice(i, 1);

                            // remove the arrays if they are empty
                            if (!delegated.selectors.length) {
                                delegatedEvents[type] = null;
                            }
                        }

                        events.removeFromElement(this._context, type, delegateListener);
                        events.removeFromElement(this._context, type, delegateUseCapture, true);

                        break;
                    }
                }
            }

            this.dropzone(false);

            interactables.splice(interactables.indexOf(this), 1);

            return interact;
        }
    };

    Interactable.prototype.gestureable = Interactable.prototype.gesturable;
    Interactable.prototype.resizeable = Interactable.prototype.resizable;

    /*\
     * interact.isSet
     [ method ]
     *
     * Check if an element has been set
     - element (Element) The Element being searched for
     = (boolean) Indicates if the element or CSS selector was previously passed to interact
    \*/
    interact.isSet = function(element, options) {
        return interactables.indexOfElement(element, options && options.context) !== -1;
    };

    /*\
     * interact.on
     [ method ]
     *
     * Adds a global listener for an InteractEvent or adds a DOM event to
     * `document`
     *
     - type       (string)   The type of event to listen for
     - listener   (function) The function to be called on that event
     - useCapture (boolean) #optional useCapture flag for addEventListener
     = (object) interact
    \*/
    interact.on = function (type, listener, useCapture) {
        // if it is an InteractEvent type, add listener to globalEvents
        if (eventTypes.indexOf(type) !== -1) {
            // if this type of event was never bound
            if (!globalEvents[type]) {
                globalEvents[type] = [listener];
            }

            // if the event listener is not already bound for this type
            else if (globalEvents[type].indexOf(listener) === -1) {

                globalEvents[type].push(listener);
            }
        }
        // If non InteratEvent type, addEventListener to document
        else {
            events.add(docTarget, type, listener, useCapture);
        }

        return interact;
    };

    /*\
     * interact.off
     [ method ]
     *
     * Removes a global InteractEvent listener or DOM event from `document`
     *
     - type       (string)   The type of event that was listened for
     - listener   (function) The listener function to be removed
     - useCapture (boolean) #optional useCapture flag for removeEventListener
     = (object) interact
    \*/
    interact.off = function (type, listener, useCapture) {
        if (eventTypes.indexOf(type) === -1) {
            events.remove(docTarget, type, listener, useCapture);
        }
        else {
            var index;

            if (type in globalEvents
                && (index = globalEvents[type].indexOf(listener)) !== -1) {
                globalEvents[type].splice(index, 1);
            }
        }

        return interact;
    };

    /*\
     * interact.simulate
     [ method ]
     *
     * Simulate pointer down to begin to interact with an interactable element
     - action       (string)  The action to be performed - drag, resize, etc.
     - element      (Element) The DOM Element to resize/drag
     - pointerEvent (object) #optional Pointer event whose pageX/Y coordinates will be the starting point of the interact drag/resize
     = (object) interact
    \*/
    interact.simulate = function (action, element, pointerEvent) {
        var event = {},
            prop,
            clientRect;

        if (action === 'resize') {
            action = 'resizexy';
        }
        // return if the action is not recognised
        if (!(action in actions)) {
            return interact;
        }

        if (pointerEvent) {
            for (prop in pointerEvent) {
                event[prop] = pointerEvent[prop];
            }
        }
        else {
            clientRect = (target._element instanceof SVGElement)?
                element.getBoundingClientRect():
                clientRect = element.getClientRects()[0];

            if (action === 'drag') {
                event.pageX = clientRect.left + clientRect.width / 2;
                event.pageY = clientRect.top + clientRect.height / 2;
            }
            else {
                event.pageX = clientRect.right;
                event.pageY = clientRect.bottom;
            }
        }

        event.target = event.currentTarget = element;
        event.preventDefault = event.stopPropagation = blank;

        pointerDown(event, action);

        return interact;
    };

    /*\
     * interact.enableDragging
     [ method ]
     *
     * Returns or sets whether dragging is enabled for any Interactables
     *
     - newValue (boolean) #optional `true` to allow the action; `false` to disable action for all Interactables
     = (boolean | object) The current setting or interact
    \*/
    interact.enableDragging = function (newValue) {
        if (newValue !== null && newValue !== undefined) {
            actionIsEnabled.drag = newValue;

            return interact;
        }
        return actionIsEnabled.drag;
    };

    /*\
     * interact.enableResizing
     [ method ]
     *
     * Returns or sets whether resizing is enabled for any Interactables
     *
     - newValue (boolean) #optional `true` to allow the action; `false` to disable action for all Interactables
     = (boolean | object) The current setting or interact
    \*/
    interact.enableResizing = function (newValue) {
        if (newValue !== null && newValue !== undefined) {
            actionIsEnabled.resize = newValue;

            return interact;
        }
        return actionIsEnabled.resize;
    };

    /*\
     * interact.enableGesturing
     [ method ]
     *
     * Returns or sets whether gesturing is enabled for any Interactables
     *
     - newValue (boolean) #optional `true` to allow the action; `false` to disable action for all Interactables
     = (boolean | object) The current setting or interact
    \*/
    interact.enableGesturing = function (newValue) {
        if (newValue !== null && newValue !== undefined) {
            actionIsEnabled.gesture = newValue;

            return interact;
        }
        return actionIsEnabled.gesture;
    };

    interact.eventTypes = eventTypes;

    /*\
     * interact.debug
     [ method ]
     *
     * Returns debugging data
     = (object) An object with properties that outline the current state and expose internal functions and variables
    \*/
    interact.debug = function () {
        return {
            target                : target,
            dragging              : dragging,
            resizing              : resizing,
            gesturing             : gesturing,
            prepared              : prepared,

            prevCoords            : prevCoords,
            downCoords            : startCoords,

            pointerIds            : pointerIds,
            pointerMoves          : pointerMoves,
            addPointer            : addPointer,
            removePointer         : removePointer,
            recordPointers        : recordPointers,

            inertia               : inertiaStatus,

            downTime              : downTime,
            downEvent             : downEvent,
            prevEvent             : prevEvent,

            Interactable          : Interactable,
            IOptions              : IOptions,
            interactables         : interactables,
            dropzones             : dropzones,
            pointerIsDown         : pointerIsDown,
            defaultOptions        : defaultOptions,
            defaultActionChecker  : defaultActionChecker,

            actions               : actions,
            dragMove              : dragMove,
            resizeMove            : resizeMove,
            gestureMove           : gestureMove,
            pointerUp             : pointerUp,
            pointerDown           : pointerDown,
            pointerMove           : pointerMove,
            pointerHover          : pointerHover,

            events                : events,
            globalEvents          : globalEvents,
            delegatedEvents       : delegatedEvents
        };
    };

    // expose the functions used to caluclate multi-touch properties
    interact.getTouchAverage  = touchAverage;
    interact.getTouchBBox     = touchBBox;
    interact.getTouchDistance = touchDistance;
    interact.getTouchAngle    = touchAngle;

    interact.getElementRect   = getElementRect;

    /*\
     * interact.margin
     [ method ]
     *
     * Returns or sets the margin for autocheck resizing used in
     * @Interactable.getAction. That is the distance from the bottom and right
     * edges of an element clicking in which will start resizing
     *
     - newValue (number) #optional
     = (number | interact) The current margin value or interact
    \*/
    interact.margin = function (newvalue) {
        if (typeof newvalue === 'number') {
            margin = newvalue;

            return interact;
        }
        return margin;
    };

    /*\
     * interact.styleCursor
     [ styleCursor ]
     *
     * Returns or sets whether the cursor style of the document is changed
     * depending on what action is being performed
     *
     - newValue (boolean) #optional
     = (boolean | interact) The current setting of interact
    \*/
    interact.styleCursor = function (newValue) {
        if (typeof newValue === 'boolean') {
            defaultOptions.styleCursor = newValue;

            return interact;
        }
        return defaultOptions.styleCursor;
    };

    /*\
     * interact.autoScroll
     [ method ]
     *
     * Returns or sets whether or not actions near the edges of the window or
     * specified container element trigger autoScroll by default
     *
     - options (boolean | object) true or false to simply enable or disable or an object with margin, distance, container and interval properties
     = (object) interact
     * or
     = (boolean | object) `false` if autoscroll is disabled and the default autoScroll settings if it is enabled
    \*/
    interact.autoScroll = function (options) {
        var defaults = defaultOptions.autoScroll;

        if (options instanceof Object) {
            defaultOptions.autoScrollEnabled = true;

            if (typeof (options.margin) === 'number') { defaults.margin = options.margin;}
            if (typeof (options.speed)  === 'number') { defaults.speed  = options.speed ;}

            defaults.container =
                (isElement(options.container) || options.container instanceof window.Window
                 ? options.container
                 : defaults.container);

            return interact;
        }

        if (typeof options === 'boolean') {
            defaultOptions.autoScrollEnabled = options;

            return interact;
        }

        // return the autoScroll settings if autoScroll is enabled
        // otherwise, return false
        return defaultOptions.autoScrollEnabled? defaults: false;
    };

    /*\
     * interact.snap
     [ method ]
     *
     * Returns or sets whether actions are constrained to a grid or a
     * collection of coordinates
     *
     - options (boolean | object) #optional New settings
     * `true` or `false` to simply enable or disable
     * or an object with some of the following properties
     o {
     o     mode   : 'grid', 'anchor' or 'path',
     o     range  : the distance within which snapping to a point occurs,
     o     grid   : {
     o         x: the distance between x-axis snap points,
     o         y: the distance between y-axis snap points
     o     },
     o     gridOffset: {
     o             x, y: the x/y-axis values of the grid origin
     o     },
     o     anchors: [
     o         {
     o             x: x coordinate to snap to,
     o             y: y coordinate to snap to,
     o             range: optional range for this anchor
     o         }
     o         {
     o             another anchor
     o         }
     o     ]
     o }
     *
     = (object | interact) The default snap settings object or interact
    \*/
    interact.snap = function (options) {
        var snap = defaultOptions.snap;

        if (options instanceof Object) {
            defaultOptions.snapEnabled = true;

            if (typeof options.mode    === 'string' ) { snap.mode    = options.mode;    }
            if (typeof options.endOnly === 'boolean') { snap.endOnly = options.endOnly; }
            if (typeof options.range   === 'number' ) { snap.range   = options.range;   }
            if (options.actions    instanceof Array ) { snap.actions    = options.actions;    }
            if (options.anchors    instanceof Array ) { snap.anchors    = options.anchors;    }
            if (options.grid       instanceof Object) { snap.grid       = options.grid;       }
            if (options.gridOffset instanceof Object) { snap.gridOffset = options.gridOffset; }

            return interact;
        }
        if (typeof options === 'boolean') {
            defaultOptions.snapEnabled = options;

            return interact;
        }

        return {
            enabled   : defaultOptions.snapEnabled,
            mode      : snap.mode,
            actions   : snap.actions,
            grid      : snap.grid,
            gridOffset: snap.gridOffset,
            anchors   : snap.anchors,
            paths     : snap.paths,
            range     : snap.range,
            locked    : snapStatus.locked,
            x         : snapStatus.x,
            y         : snapStatus.y,
            realX     : snapStatus.realX,
            realY     : snapStatus.realY,
            dx        : snapStatus.dx,
            dy        : snapStatus.dy
        };
    };

    /*\
     * interact.inertia
     [ method ]
     *
     * Returns or sets inertia settings.
     *
     * See @Interactable.inertia
     *
     - options (boolean | object) #optional New settings
     * `true` or `false` to simply enable or disable
     * or an object of inertia options
     = (object | interact) The default inertia settings object or interact
    \*/
    interact.inertia = function (options) {
        var inertia = defaultOptions.inertia;

        if (options instanceof Object) {
            defaultOptions.inertiaEnabled = true;

            if (typeof options.resistance === 'number') { inertia.resistance = options.resistance;}
            if (typeof options.minSpeed   === 'number') { inertia.minSpeed   = options.minSpeed  ;}
            if (typeof options.endSpeed   === 'number') { inertia.endSpeed   = options.endSpeed  ;}

            if (typeof options.zeroResumeDelta === 'boolean') { inertia.zeroResumeDelta = options.zeroResumeDelta  ;}

            if (options.actions instanceof Array) { inertia.actions = options.actions; }

            return interact;
        }
        if (typeof options === 'boolean') {
            defaultOptions.inertiaEnabled = options;

            return interact;
        }

        return {
            enabled: defaultOptions.inertiaEnabled,
            resistance: inertia.resistance,
            minSpeed: inertia.minSpeed,
            endSpeed: inertia.endSpeed,
            actions: inertia.actions,
            zeroResumeDelta: inertia.zeroResumeDelta
        };
    };

    /*\
     * interact.supportsTouch
     [ method ]
     *
     = (boolean) Whether or not the browser supports touch input
    \*/
    interact.supportsTouch = function () {
        return supportsTouch;
    };

    /*\
     * interact.currentAction
     [ method ]
     *
     = (string) What action is currently being performed
    \*/
    interact.currentAction = function () {
        return (dragging && 'drag') || (resizing && 'resize') || (gesturing && 'gesture') || null;
    };

    /*\
     * interact.stop
     [ method ]
     *
     * Ends the current interaction
     *
     - event (Event) An event on which to call preventDefault()
     = (object) interact
    \*/
    interact.stop = function (event) {
        if (dragging || resizing || gesturing) {
            autoScroll.stop();
            matches = [];

            if (target.options.styleCursor) {
                document.documentElement.style.cursor = '';
            }

            if (target._gesture) {
                target._gesture.stop();
            }

            clearTargets();

            for (var i = 0; i < selectorDZs.length; i++) {
                selectorDZs._elements = [];
            }

            // prevent Default only if were previously interacting
            if (event && typeof event.preventDefault === 'function') {
               event.preventDefault();
            }
        }

        if (pointerIds && pointerIds.length) {
            pointerIds.splice(0);
            pointerMoves.splice(0);
        }

        pointerIsDown = snapStatus.locked = dragging = resizing = gesturing = false;
        prepared = prevEvent = null;
        // do not clear the downEvent so that it can be used to
        // test for browser-simulated mouse events after touch

        return interact;
    };

    /*\
     * interact.dynamicDrop
     [ method ]
     *
     * Returns or sets whether the dimensions of dropzone elements are
     * calculated on every dragmove or only on dragstart for the default
     * dropChecker
     *
     - newValue (boolean) #optional True to check on each move. False to check only before start
     = (boolean | interact) The current setting or interact
    \*/
    interact.dynamicDrop = function (newValue) {
        if (typeof newValue === 'boolean') {
            if (dragging && dynamicDrop !== newValue && !newValue) {
                calcRects(dropzones);
            }

            dynamicDrop = newValue;

            return interact;
        }
        return dynamicDrop;
    };

    /*\
     * interact.deltaSource
     [ method ]
     * Returns or sets weather pageX/Y or clientX/Y is used to calculate dx/dy.
     *
     * See @Interactable.deltaSource
     *
     - newValue (string) #optional 'page' or 'client'
     = (string | Interactable) The current setting or interact
    \*/
    interact.deltaSource = function (newValue) {
        if (newValue === 'page' || newValue === 'client') {
            defaultOptions.deltaSource = newValue;

            return this;
        }
        return defaultOptions.deltaSource;
    };


    /*\
     * interact.restrict
     [ method ]
     *
     * Returns or sets the default rectangles within which actions (after snap
     * calculations) are restricted.
     *
     * See @Interactable.restrict
     *
     - newValue (object) #optional an object with keys drag, resize, and/or gesture and rects or Elements as values
     = (object) The current restrictions object or interact
    \*/
    interact.restrict = function (newValue) {
        var defaults = defaultOptions.restrict;

        if (newValue === undefined) {
            return defaultOptions.restrict;
        }

        if (newValue instanceof Object) {
            if (newValue.drag instanceof Object || /^parent$|^self$/.test(newValue.drag)) {
                defaults.drag = newValue.drag;
            }
            if (newValue.resize instanceof Object || /^parent$|^self$/.test(newValue.resize)) {
                defaults.resize = newValue.resize;
            }
            if (newValue.gesture instanceof Object || /^parent$|^self$/.test(newValue.gesture)) {
                defaults.gesture = newValue.gesture;
            }

            if (typeof newValue.endOnly === 'boolean') {
                defaults.endOnly = newValue.endOnly;
            }
        }

        else if (newValue === null) {
           defaults.drag = defaults.resize = defaults.gesture = null;
           defaults.endOnly = false;
        }

        return this;
    };

    if (PointerEvent) {
        events.add(docTarget, 'pointerup', collectTaps);

        events.add(docTarget, 'pointerdown'    , selectorDown);
        events.add(docTarget, 'MSGestureChange', pointerMove );
        events.add(docTarget, 'MSGestureEnd'   , pointerUp   );
        events.add(docTarget, 'MSInertiaStart' , pointerUp   );
        events.add(docTarget, 'pointerover'    , pointerOver );
        events.add(docTarget, 'pointerout'     , pointerOut  );

        events.add(docTarget, 'pointermove'  , recordPointers);
        events.add(docTarget, 'pointerup'    , recordPointers);
        events.add(docTarget, 'pointercancel', recordPointers);

        // fix problems of wrong targets in IE
        events.add(docTarget, 'pointerup', function () {
            if (!(dragging || resizing || gesturing)) {
                pointerIsDown = false;
            }
        });

        selectorGesture = new Gesture();
        selectorGesture.target = document.documentElement;
    }
    else {
        events.add(docTarget, 'mouseup' , collectTaps);
        events.add(docTarget, 'touchend', collectTaps);

        events.add(docTarget, 'mousedown', selectorDown);
        events.add(docTarget, 'mousemove', pointerMove );
        events.add(docTarget, 'mouseup'  , pointerUp   );
        events.add(docTarget, 'mouseover', pointerOver );
        events.add(docTarget, 'mouseout' , pointerOut  );

        events.add(docTarget, 'touchstart' , selectorDown);
        events.add(docTarget, 'touchmove'  , pointerMove );
        events.add(docTarget, 'touchend'   , pointerUp   );
        events.add(docTarget, 'touchcancel', pointerUp   );
    }

    events.add(windowTarget, 'blur', pointerUp);

    try {
        if (window.frameElement) {
            parentDocTarget._element = window.frameElement.ownerDocument;

            events.add(parentDocTarget   , 'mouseup'      , pointerUp);
            events.add(parentDocTarget   , 'touchend'     , pointerUp);
            events.add(parentDocTarget   , 'touchcancel'  , pointerUp);
            events.add(parentDocTarget   , 'pointerup'    , pointerUp);
            events.add(parentWindowTarget, 'blur'         , pointerUp);
        }
    }
    catch (error) {
        interact.windowParentError = error;
    }

    // For IE's lack of Event#preventDefault
    events.add(docTarget,    'selectstart', function (e) {
        if (dragging || resizing || gesturing) {
            e.preventDefault();
        }
    });

    // For IE8's lack of an Element#matchesSelector
    if (!(matchesSelector in Element.prototype) || typeof (Element.prototype[matchesSelector]) !== 'function') {
        Element.prototype[matchesSelector] = IE8MatchesSelector = function (selector, elems) {
            // http://tanalin.com/en/blog/2012/12/matches-selector-ie8/
            // modified for better performance
            elems = elems || this.parentNode.querySelectorAll(selector);
            var count = elems.length;

            for (var i = 0; i < count; i++) {
                if (elems[i] === this) {
                    return true;
                }
            }

            return false;
        };
    }

    // requestAnimationFrame polyfill
    (function() {
        var lastTime = 0,
            vendors = ['ms', 'moz', 'webkit', 'o'];

        for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            reqFrame = window[vendors[x]+'RequestAnimationFrame'];
            cancelFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
        }

        if (!reqFrame) {
            reqFrame = function(callback) {
                var currTime = new Date().getTime(),
                    timeToCall = Math.max(0, 16 - (currTime - lastTime)),
                    id = window.setTimeout(function() { callback(currTime + timeToCall); },
                  timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };
        }

        if (!cancelFrame) {
            cancelFrame = function(id) {
                clearTimeout(id);
            };
        }
    }());

    window.interact = interact;

} ());
(function(definition){if(typeof exports==="object"){module.exports=definition();}else if(typeof define==="function"&&define.amd){define(definition);}else{chessground=definition();}})(function(){return function(){
var h;
function q(a){var b=typeof a;if("object"==b)if(a){if(a instanceof Array)return"array";if(a instanceof Object)return b;var c=Object.prototype.toString.call(a);if("[object Window]"==c)return"object";if("[object Array]"==c||"number"==typeof a.length&&"undefined"!=typeof a.splice&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("splice"))return"array";if("[object Function]"==c||"undefined"!=typeof a.call&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("call"))return"function"}else return"null";else if("function"==
b&&"undefined"==typeof a.call)return"object";return b}var ba="closure_uid_"+(1E9*Math.random()>>>0),ca=0;function da(a,b){for(var c in a)b.call(void 0,a[c],c,a)};function fa(a,b){null!=a&&this.append.apply(this,arguments)}fa.prototype.Wa="";fa.prototype.set=function(a){this.Wa=""+a};fa.prototype.append=function(a,b,c){this.Wa+=a;if(null!=b)for(var d=1;d<arguments.length;d++)this.Wa+=arguments[d];return this};fa.prototype.toString=function(){return this.Wa};var ga=null;function ha(){return new s(null,5,[ia,!0,ja,!0,ka,!1,la,!1,ma,null],null)}function u(a){return null!=a&&!1!==a}function na(a){return u(a)?!1:!0}function w(a,b){return a[q(null==b?null:b)]?!0:a._?!0:!1}function oa(a){return null==a?null:a.constructor}function x(a,b){var c=oa(b),c=u(u(c)?c.Ya:c)?c.Xa:q(b);return Error(["No protocol method ",a," defined for type ",c,": ",b].join(""))}function qa(a){var b=a.Xa;return u(b)?b:""+y.c(a)}
function ra(a){for(var b=a.length,c=Array(b),d=0;;)if(d<b)c[d]=a[d],d+=1;else break;return c}function ta(a){return Array.prototype.slice.call(arguments)}
var va=function(){function a(a,b){return ua.e?ua.e(function(a,b){a.push(b);return a},[],b):ua.call(null,function(a,b){a.push(b);return a},[],b)}function b(a){return c.d(null,a)}var c=null,c=function(d,c){switch(arguments.length){case 1:return b.call(this,d);case 2:return a.call(this,0,c)}throw Error("Invalid arity: "+arguments.length);};c.c=b;c.d=a;return c}(),ya={},za={};
function Aa(a){if(a?a.ca:a)return a.ca(a);var b;b=Aa[q(null==a?null:a)];if(!b&&(b=Aa._,!b))throw x("ICloneable.-clone",a);return b.call(null,a)}var Ca={};function Da(a){if(a?a.Q:a)return a.Q(a);var b;b=Da[q(null==a?null:a)];if(!b&&(b=Da._,!b))throw x("ICounted.-count",a);return b.call(null,a)}function Ea(a){if(a?a.R:a)return a.R(a);var b;b=Ea[q(null==a?null:a)];if(!b&&(b=Ea._,!b))throw x("IEmptyableCollection.-empty",a);return b.call(null,a)}var Fa={};
function Ha(a,b){if(a?a.P:a)return a.P(a,b);var c;c=Ha[q(null==a?null:a)];if(!c&&(c=Ha._,!c))throw x("ICollection.-conj",a);return c.call(null,a,b)}
var Ia={},A=function(){function a(a,b,c){if(a?a.$:a)return a.$(a,b,c);var g;g=A[q(null==a?null:a)];if(!g&&(g=A._,!g))throw x("IIndexed.-nth",a);return g.call(null,a,b,c)}function b(a,b){if(a?a.L:a)return a.L(a,b);var c;c=A[q(null==a?null:a)];if(!c&&(c=A._,!c))throw x("IIndexed.-nth",a);return c.call(null,a,b)}var c=null,c=function(d,c,f){switch(arguments.length){case 2:return b.call(this,d,c);case 3:return a.call(this,d,c,f)}throw Error("Invalid arity: "+arguments.length);};c.d=b;c.e=a;return c}(),
Ja={};function Ka(a){if(a?a.X:a)return a.X(a);var b;b=Ka[q(null==a?null:a)];if(!b&&(b=Ka._,!b))throw x("ISeq.-first",a);return b.call(null,a)}function Ma(a){if(a?a.ba:a)return a.ba(a);var b;b=Ma[q(null==a?null:a)];if(!b&&(b=Ma._,!b))throw x("ISeq.-rest",a);return b.call(null,a)}
var Na={},Oa={},Pa=function(){function a(a,b,c){if(a?a.C:a)return a.C(a,b,c);var g;g=Pa[q(null==a?null:a)];if(!g&&(g=Pa._,!g))throw x("ILookup.-lookup",a);return g.call(null,a,b,c)}function b(a,b){if(a?a.B:a)return a.B(a,b);var c;c=Pa[q(null==a?null:a)];if(!c&&(c=Pa._,!c))throw x("ILookup.-lookup",a);return c.call(null,a,b)}var c=null,c=function(d,c,f){switch(arguments.length){case 2:return b.call(this,d,c);case 3:return a.call(this,d,c,f)}throw Error("Invalid arity: "+arguments.length);};c.d=b;c.e=
a;return c}();function Qa(a,b){if(a?a.eb:a)return a.eb(a,b);var c;c=Qa[q(null==a?null:a)];if(!c&&(c=Qa._,!c))throw x("IAssociative.-contains-key?",a);return c.call(null,a,b)}function Sa(a,b,c){if(a?a.Oa:a)return a.Oa(a,b,c);var d;d=Sa[q(null==a?null:a)];if(!d&&(d=Sa._,!d))throw x("IAssociative.-assoc",a);return d.call(null,a,b,c)}var Ta={};function Va(a,b){if(a?a.pb:a)return a.pb(a,b);var c;c=Va[q(null==a?null:a)];if(!c&&(c=Va._,!c))throw x("IMap.-dissoc",a);return c.call(null,a,b)}var Wa={};
function Xa(a){if(a?a.Cb:a)return a.Cb();var b;b=Xa[q(null==a?null:a)];if(!b&&(b=Xa._,!b))throw x("IMapEntry.-key",a);return b.call(null,a)}function Ya(a){if(a?a.Mb:a)return a.Mb();var b;b=Ya[q(null==a?null:a)];if(!b&&(b=Ya._,!b))throw x("IMapEntry.-val",a);return b.call(null,a)}var Za={};function $a(a,b){if(a?a.Ob:a)return a.Ob(0,b);var c;c=$a[q(null==a?null:a)];if(!c&&(c=$a._,!c))throw x("ISet.-disjoin",a);return c.call(null,a,b)}var ab={};
function cb(a,b,c){if(a?a.Db:a)return a.Db(a,b,c);var d;d=cb[q(null==a?null:a)];if(!d&&(d=cb._,!d))throw x("IVector.-assoc-n",a);return d.call(null,a,b,c)}function db(a){if(a?a.Pa:a)return a.Pa(a);var b;b=db[q(null==a?null:a)];if(!b&&(b=db._,!b))throw x("IDeref.-deref",a);return b.call(null,a)}var eb={};function fb(a){if(a?a.G:a)return a.G(a);var b;b=fb[q(null==a?null:a)];if(!b&&(b=fb._,!b))throw x("IMeta.-meta",a);return b.call(null,a)}var gb={};
function hb(a,b){if(a?a.I:a)return a.I(a,b);var c;c=hb[q(null==a?null:a)];if(!c&&(c=hb._,!c))throw x("IWithMeta.-with-meta",a);return c.call(null,a,b)}
var kb={},lb=function(){function a(a,b,c){if(a?a.W:a)return a.W(a,b,c);var g;g=lb[q(null==a?null:a)];if(!g&&(g=lb._,!g))throw x("IReduce.-reduce",a);return g.call(null,a,b,c)}function b(a,b){if(a?a.V:a)return a.V(a,b);var c;c=lb[q(null==a?null:a)];if(!c&&(c=lb._,!c))throw x("IReduce.-reduce",a);return c.call(null,a,b)}var c=null,c=function(d,c,f){switch(arguments.length){case 2:return b.call(this,d,c);case 3:return a.call(this,d,c,f)}throw Error("Invalid arity: "+arguments.length);};c.d=b;c.e=a;return c}();
function mb(a,b){if(a?a.F:a)return a.F(a,b);var c;c=mb[q(null==a?null:a)];if(!c&&(c=mb._,!c))throw x("IEquiv.-equiv",a);return c.call(null,a,b)}function nb(a){if(a?a.K:a)return a.K(a);var b;b=nb[q(null==a?null:a)];if(!b&&(b=nb._,!b))throw x("IHash.-hash",a);return b.call(null,a)}var ob={};function pb(a){if(a?a.N:a)return a.N(a);var b;b=pb[q(null==a?null:a)];if(!b&&(b=pb._,!b))throw x("ISeqable.-seq",a);return b.call(null,a)}var qb={},rb={};
function tb(a){if(a?a.qb:a)return a.qb(a);var b;b=tb[q(null==a?null:a)];if(!b&&(b=tb._,!b))throw x("IReversible.-rseq",a);return b.call(null,a)}function B(a,b){if(a?a.Tb:a)return a.Tb(0,b);var c;c=B[q(null==a?null:a)];if(!c&&(c=B._,!c))throw x("IWriter.-write",a);return c.call(null,a,b)}var ub={};function vb(a,b,c){if(a?a.H:a)return a.H(a,b,c);var d;d=vb[q(null==a?null:a)];if(!d&&(d=vb._,!d))throw x("IPrintWithWriter.-pr-writer",a);return d.call(null,a,b,c)}
function wb(a,b,c){if(a?a.Rb:a)return a.Rb(0,b,c);var d;d=wb[q(null==a?null:a)];if(!d&&(d=wb._,!d))throw x("IWatchable.-notify-watches",a);return d.call(null,a,b,c)}function xb(a,b,c){if(a?a.Qb:a)return a.Qb(0,b,c);var d;d=xb[q(null==a?null:a)];if(!d&&(d=xb._,!d))throw x("IWatchable.-add-watch",a);return d.call(null,a,b,c)}function yb(a,b){if(a?a.Sb:a)return a.Sb(0,b);var c;c=yb[q(null==a?null:a)];if(!c&&(c=yb._,!c))throw x("IWatchable.-remove-watch",a);return c.call(null,a,b)}
function zb(a){if(a?a.fb:a)return a.fb(a);var b;b=zb[q(null==a?null:a)];if(!b&&(b=zb._,!b))throw x("IEditableCollection.-as-transient",a);return b.call(null,a)}function Ab(a,b){if(a?a.Qa:a)return a.Qa(a,b);var c;c=Ab[q(null==a?null:a)];if(!c&&(c=Ab._,!c))throw x("ITransientCollection.-conj!",a);return c.call(null,a,b)}function Bb(a){if(a?a.Ra:a)return a.Ra(a);var b;b=Bb[q(null==a?null:a)];if(!b&&(b=Bb._,!b))throw x("ITransientCollection.-persistent!",a);return b.call(null,a)}
function Cb(a,b,c){if(a?a.hb:a)return a.hb(a,b,c);var d;d=Cb[q(null==a?null:a)];if(!d&&(d=Cb._,!d))throw x("ITransientAssociative.-assoc!",a);return d.call(null,a,b,c)}function Db(a,b,c){if(a?a.Pb:a)return a.Pb(0,b,c);var d;d=Db[q(null==a?null:a)];if(!d&&(d=Db._,!d))throw x("ITransientVector.-assoc-n!",a);return d.call(null,a,b,c)}function Fb(a){if(a?a.Jb:a)return a.Jb();var b;b=Fb[q(null==a?null:a)];if(!b&&(b=Fb._,!b))throw x("IChunk.-drop-first",a);return b.call(null,a)}
function Gb(a){if(a?a.Ab:a)return a.Ab(a);var b;b=Gb[q(null==a?null:a)];if(!b&&(b=Gb._,!b))throw x("IChunkedSeq.-chunked-first",a);return b.call(null,a)}function Hb(a){if(a?a.Bb:a)return a.Bb(a);var b;b=Hb[q(null==a?null:a)];if(!b&&(b=Hb._,!b))throw x("IChunkedSeq.-chunked-rest",a);return b.call(null,a)}function Ib(a){if(a?a.zb:a)return a.zb(a);var b;b=Ib[q(null==a?null:a)];if(!b&&(b=Ib._,!b))throw x("IChunkedNext.-chunked-next",a);return b.call(null,a)}var Jb={};
function Kb(a,b){if(a?a.Ac:a)return a.Ac(a,b);var c;c=Kb[q(null==a?null:a)];if(!c&&(c=Kb._,!c))throw x("IReset.-reset!",a);return c.call(null,a,b)}
var Lb=function(){function a(a,b,d,c,e){if(a?a.Fc:a)return a.Fc(a,b,d,c,e);var n;n=Lb[q(null==a?null:a)];if(!n&&(n=Lb._,!n))throw x("ISwap.-swap!",a);return n.call(null,a,b,d,c,e)}function b(a,b,d,c){if(a?a.Ec:a)return a.Ec(a,b,d,c);var e;e=Lb[q(null==a?null:a)];if(!e&&(e=Lb._,!e))throw x("ISwap.-swap!",a);return e.call(null,a,b,d,c)}function c(a,b,d){if(a?a.Dc:a)return a.Dc(a,b,d);var c;c=Lb[q(null==a?null:a)];if(!c&&(c=Lb._,!c))throw x("ISwap.-swap!",a);return c.call(null,a,b,d)}function d(a,b){if(a?
a.Cc:a)return a.Cc(a,b);var d;d=Lb[q(null==a?null:a)];if(!d&&(d=Lb._,!d))throw x("ISwap.-swap!",a);return d.call(null,a,b)}var e=null,e=function(e,g,k,l,m){switch(arguments.length){case 2:return d.call(this,e,g);case 3:return c.call(this,e,g,k);case 4:return b.call(this,e,g,k,l);case 5:return a.call(this,e,g,k,l,m)}throw Error("Invalid arity: "+arguments.length);};e.d=d;e.e=c;e.m=b;e.v=a;return e}();function Mb(a){this.ed=a;this.t=0;this.j=1073741824}Mb.prototype.Tb=function(a,b){return this.ed.append(b)};
function Nb(a){var b=new fa;a.H(null,new Mb(b),ha());return""+y.c(b)}var Ob="undefined"!==typeof Math.imul&&0!==(Math.imul.d?Math.imul.d(4294967295,5):Math.imul.call(null,4294967295,5))?function(a,b){return Math.imul.d?Math.imul.d(a,b):Math.imul.call(null,a,b)}:function(a,b){var c=a&65535,d=b&65535;return c*d+((a>>>16&65535)*d+c*(b>>>16&65535)<<16>>>0)|0};function Pb(a){a=Ob(a,3432918353);return Ob(a<<15|a>>>-15,461845907)}function Rb(a,b){var c=a^b;return Ob(c<<13|c>>>-13,5)+3864292196}
function Sb(a,b){var c=a^b,c=Ob(c^c>>>16,2246822507),c=Ob(c^c>>>13,3266489909);return c^c>>>16}function Tb(a){var b;a:{b=1;for(var c=0;;)if(b<a.length){var d=b+2,c=Rb(c,Pb(a.charCodeAt(b-1)|a.charCodeAt(b)<<16));b=d}else{b=c;break a}b=void 0}b=1===(a.length&1)?b^Pb(a.charCodeAt(a.length-1)):b;return Sb(b,Ob(2,a.length))}var Ub={},Vb=0;
function Wb(a){255<Vb&&(Ub={},Vb=0);var b=Ub[a];if("number"!==typeof b){a:if(null!=a)if(b=a.length,0<b){for(var c=0,d=0;;)if(c<b)var e=c+1,d=Ob(31,d)+a.charCodeAt(c),c=e;else{b=d;break a}b=void 0}else b=0;else b=0;Ub[a]=b;Vb+=1}return a=b}function Xb(a){a&&(a.j&4194304||a.od)?a=a.K(null):"number"===typeof a?a=(Math.floor.c?Math.floor.c(a):Math.floor.call(null,a))%2147483647:!0===a?a=1:!1===a?a=0:"string"===typeof a?(a=Wb(a),0!==a&&(a=Pb(a),a=Rb(0,a),a=Sb(a,4))):a=null==a?0:nb(a);return a}
function Yb(a,b){return a^b+2654435769+(a<<6)+(a>>2)}function Zb(a,b){if(u(C.d?C.d(a,b):C.call(null,a,b)))return 0;var c=na(a.fa);if(u(c?b.fa:c))return-1;if(u(a.fa)){if(na(b.fa))return 1;c=$b.d?$b.d(a.fa,b.fa):$b.call(null,a.fa,b.fa);return 0===c?$b.d?$b.d(a.name,b.name):$b.call(null,a.name,b.name):c}return $b.d?$b.d(a.name,b.name):$b.call(null,a.name,b.name)}function D(a,b,c,d,e){this.fa=a;this.name=b;this.Na=c;this.Va=d;this.ka=e;this.j=2154168321;this.t=4096}h=D.prototype;
h.H=function(a,b){return B(b,this.Na)};h.K=function(){var a=this.Va;return null!=a?a:this.Va=a=Yb(Tb(this.name),Wb(this.fa))};h.I=function(a,b){return new D(this.fa,this.name,this.Na,this.Va,b)};h.G=function(){return this.ka};h.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return Pa.e(c,this,null);case 3:return Pa.e(c,this,d)}throw Error("Invalid arity: "+arguments.length);};a.d=function(a,c){return Pa.e(c,this,null)};a.e=function(a,c,d){return Pa.e(c,this,d)};return a}();
h.apply=function(a,b){return this.call.apply(this,[this].concat(ra(b)))};h.c=function(a){return Pa.e(a,this,null)};h.d=function(a,b){return Pa.e(a,this,b)};h.F=function(a,b){return b instanceof D?this.Na===b.Na:!1};h.toString=function(){return this.Na};
var ac=function(){function a(a,b){var c=null!=a?""+y.c(a)+"/"+y.c(b):b;return new D(a,b,c,null,null)}function b(a){return a instanceof D?a:c.d(null,a)}var c=null,c=function(d,c){switch(arguments.length){case 1:return b.call(this,d);case 2:return a.call(this,d,c)}throw Error("Invalid arity: "+arguments.length);};c.c=b;c.d=a;return c}();
function E(a){if(null==a)return null;if(a&&(a.j&8388608||a.Bc))return a.N(null);if(a instanceof Array||"string"===typeof a)return 0===a.length?null:new bc(a,0);if(w(ob,a))return pb(a);throw Error(""+y.c(a)+" is not ISeqable");}function F(a){if(null==a)return null;if(a&&(a.j&64||a.gb))return a.X(null);a=E(a);return null==a?null:Ka(a)}function G(a){return null!=a?a&&(a.j&64||a.gb)?a.ba(null):(a=E(a))?Ma(a):I:I}function K(a){return null==a?null:a&&(a.j&128||a.Nb)?a.aa(null):E(G(a))}
var C=function(){function a(a,b){return null==a?null==b:a===b||mb(a,b)}var b=null,c=function(){function a(b,d,k){var l=null;2<arguments.length&&(l=L(Array.prototype.slice.call(arguments,2),0));return c.call(this,b,d,l)}function c(a,d,e){for(;;)if(b.d(a,d))if(K(e))a=d,d=F(e),e=K(e);else return b.d(d,F(e));else return!1}a.r=2;a.k=function(a){var b=F(a);a=K(a);var d=F(a);a=G(a);return c(b,d,a)};a.g=c;return a}(),b=function(b,e,f){switch(arguments.length){case 1:return!0;case 2:return a.call(this,b,e);
default:return c.g(b,e,L(arguments,2))}throw Error("Invalid arity: "+arguments.length);};b.r=2;b.k=c.k;b.c=function(){return!0};b.d=a;b.g=c.g;return b}();function cc(a,b){var c=Pb(a),c=Rb(0,c);return Sb(c,b)}function dc(a){var b=0,c=1;for(a=E(a);;)if(null!=a)b+=1,c=Ob(31,c)+Xb(F(a))|0,a=K(a);else return cc(c,b)}function ec(a){var b=0,c=0;for(a=E(a);;)if(null!=a)b+=1,c=c+Xb(F(a))|0,a=K(a);else return cc(c,b)}Ca["null"]=!0;Da["null"]=function(){return 0};Date.prototype.uc=!0;
Date.prototype.F=function(a,b){return b instanceof Date&&this.toString()===b.toString()};mb.number=function(a,b){return a===b};eb["function"]=!0;fb["function"]=function(){return null};ya["function"]=!0;nb._=function(a){return a[ba]||(a[ba]=++ca)};function fc(a){return a+1}function gc(a){this.S=a;this.t=0;this.j=32768}gc.prototype.Pa=function(){return this.S};function hc(a){return a instanceof gc}function M(a){return db(a)}
var jc=function(){function a(a,b,d,c){for(var l=Da(a);;)if(c<l){d=b.d?b.d(d,A.d(a,c)):b.call(null,d,A.d(a,c));if(hc(d))return db(d);c+=1}else return d}function b(a,b,d){for(var c=Da(a),l=0;;)if(l<c){d=b.d?b.d(d,A.d(a,l)):b.call(null,d,A.d(a,l));if(hc(d))return db(d);l+=1}else return d}function c(a,b){var d=Da(a);if(0===d)return b.n?b.n():b.call(null);for(var c=A.d(a,0),l=1;;)if(l<d){c=b.d?b.d(c,A.d(a,l)):b.call(null,c,A.d(a,l));if(hc(c))return db(c);l+=1}else return c}var d=null,d=function(d,f,g,
k){switch(arguments.length){case 2:return c.call(this,d,f);case 3:return b.call(this,d,f,g);case 4:return a.call(this,d,f,g,k)}throw Error("Invalid arity: "+arguments.length);};d.d=c;d.e=b;d.m=a;return d}(),kc=function(){function a(a,b,d,c){for(var l=a.length;;)if(c<l){d=b.d?b.d(d,a[c]):b.call(null,d,a[c]);if(hc(d))return db(d);c+=1}else return d}function b(a,b,d){for(var c=a.length,l=0;;)if(l<c){d=b.d?b.d(d,a[l]):b.call(null,d,a[l]);if(hc(d))return db(d);l+=1}else return d}function c(a,b){var d=
a.length;if(0===a.length)return b.n?b.n():b.call(null);for(var c=a[0],l=1;;)if(l<d){c=b.d?b.d(c,a[l]):b.call(null,c,a[l]);if(hc(c))return db(c);l+=1}else return c}var d=null,d=function(d,f,g,k){switch(arguments.length){case 2:return c.call(this,d,f);case 3:return b.call(this,d,f,g);case 4:return a.call(this,d,f,g,k)}throw Error("Invalid arity: "+arguments.length);};d.d=c;d.e=b;d.m=a;return d}();function lc(a){return a?a.j&2||a.pc?!0:a.j?!1:w(Ca,a):w(Ca,a)}
function mc(a){return a?a.j&16||a.Kb?!0:a.j?!1:w(Ia,a):w(Ia,a)}function bc(a,b){this.f=a;this.i=b;this.j=166199550;this.t=8192}h=bc.prototype;h.toString=function(){return Nb(this)};h.L=function(a,b){var c=b+this.i;return c<this.f.length?this.f[c]:null};h.$=function(a,b,c){a=b+this.i;return a<this.f.length?this.f[a]:c};h.ca=function(){return new bc(this.f,this.i)};h.aa=function(){return this.i+1<this.f.length?new bc(this.f,this.i+1):null};h.Q=function(){return this.f.length-this.i};
h.qb=function(){var a=Da(this);return 0<a?new nc(this,a-1,null):null};h.K=function(){return dc(this)};h.F=function(a,b){return oc.d?oc.d(this,b):oc.call(null,this,b)};h.R=function(){return I};h.V=function(a,b){return kc.m(this.f,b,this.f[this.i],this.i+1)};h.W=function(a,b,c){return kc.m(this.f,b,c,this.i)};h.X=function(){return this.f[this.i]};h.ba=function(){return this.i+1<this.f.length?new bc(this.f,this.i+1):I};h.N=function(){return this};
h.P=function(a,b){return N.d?N.d(b,this):N.call(null,b,this)};
var pc=function(){function a(a,b){return b<a.length?new bc(a,b):null}function b(a){return c.d(a,0)}var c=null,c=function(d,c){switch(arguments.length){case 1:return b.call(this,d);case 2:return a.call(this,d,c)}throw Error("Invalid arity: "+arguments.length);};c.c=b;c.d=a;return c}(),L=function(){function a(a,b){return pc.d(a,b)}function b(a){return pc.d(a,0)}var c=null,c=function(d,c){switch(arguments.length){case 1:return b.call(this,d);case 2:return a.call(this,d,c)}throw Error("Invalid arity: "+
arguments.length);};c.c=b;c.d=a;return c}();function nc(a,b,c){this.cb=a;this.i=b;this.meta=c;this.j=32374990;this.t=8192}h=nc.prototype;h.toString=function(){return Nb(this)};h.G=function(){return this.meta};h.ca=function(){return new nc(this.cb,this.i,this.meta)};h.aa=function(){return 0<this.i?new nc(this.cb,this.i-1,null):null};h.Q=function(){return this.i+1};h.K=function(){return dc(this)};h.F=function(a,b){return oc.d?oc.d(this,b):oc.call(null,this,b)};
h.R=function(){return qc.d?qc.d(I,this.meta):qc.call(null,I,this.meta)};h.V=function(a,b){return rc.d?rc.d(b,this):rc.call(null,b,this)};h.W=function(a,b,c){return rc.e?rc.e(b,c,this):rc.call(null,b,c,this)};h.X=function(){return A.d(this.cb,this.i)};h.ba=function(){return 0<this.i?new nc(this.cb,this.i-1,null):I};h.N=function(){return this};h.I=function(a,b){return new nc(this.cb,this.i,b)};h.P=function(a,b){return N.d?N.d(b,this):N.call(null,b,this)};function sc(a){return F(K(a))}
mb._=function(a,b){return a===b};
var uc=function(){function a(a,b){return null!=a?Ha(a,b):Ha(I,b)}var b=null,c=function(){function a(b,d,k){var l=null;2<arguments.length&&(l=L(Array.prototype.slice.call(arguments,2),0));return c.call(this,b,d,l)}function c(a,d,e){for(;;)if(u(e))a=b.d(a,d),d=F(e),e=K(e);else return b.d(a,d)}a.r=2;a.k=function(a){var b=F(a);a=K(a);var d=F(a);a=G(a);return c(b,d,a)};a.g=c;return a}(),b=function(b,e,f){switch(arguments.length){case 0:return tc;case 1:return b;case 2:return a.call(this,b,e);default:return c.g(b,
e,L(arguments,2))}throw Error("Invalid arity: "+arguments.length);};b.r=2;b.k=c.k;b.n=function(){return tc};b.c=function(a){return a};b.d=a;b.g=c.g;return b}();function vc(a){return null==a?null:Ea(a)}function O(a){if(null!=a)if(a&&(a.j&2||a.pc))a=a.Q(null);else if(a instanceof Array)a=a.length;else if("string"===typeof a)a=a.length;else if(w(Ca,a))a=Da(a);else a:{a=E(a);for(var b=0;;){if(lc(a)){a=b+Da(a);break a}a=K(a);b+=1}a=void 0}else a=0;return a}
var wc=function(){function a(a,b,c){for(;;){if(null==a)return c;if(0===b)return E(a)?F(a):c;if(mc(a))return A.e(a,b,c);if(E(a))a=K(a),b-=1;else return c}}function b(a,b){for(;;){if(null==a)throw Error("Index out of bounds");if(0===b){if(E(a))return F(a);throw Error("Index out of bounds");}if(mc(a))return A.d(a,b);if(E(a)){var c=K(a),g=b-1;a=c;b=g}else throw Error("Index out of bounds");}}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return b.call(this,c,e);case 3:return a.call(this,
c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.d=b;c.e=a;return c}(),Q=function(){function a(a,b,c){if("number"!==typeof b)throw Error("index argument to nth must be a number.");if(null==a)return c;if(a&&(a.j&16||a.Kb))return a.$(null,b,c);if(a instanceof Array||"string"===typeof a)return b<a.length?a[b]:c;if(w(Ia,a))return A.d(a,b);if(a?a.j&64||a.gb||(a.j?0:w(Ja,a)):w(Ja,a))return wc.e(a,b,c);throw Error("nth not supported on this type "+y.c(qa(oa(a))));}function b(a,b){if("number"!==
typeof b)throw Error("index argument to nth must be a number");if(null==a)return a;if(a&&(a.j&16||a.Kb))return a.L(null,b);if(a instanceof Array||"string"===typeof a)return b<a.length?a[b]:null;if(w(Ia,a))return A.d(a,b);if(a?a.j&64||a.gb||(a.j?0:w(Ja,a)):w(Ja,a))return wc.d(a,b);throw Error("nth not supported on this type "+y.c(qa(oa(a))));}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return b.call(this,c,e);case 3:return a.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);
};c.d=b;c.e=a;return c}(),R=function(){function a(a,b,c){return null!=a?a&&(a.j&256||a.Lb)?a.C(null,b,c):a instanceof Array?b<a.length?a[b]:c:"string"===typeof a?b<a.length?a[b]:c:w(Oa,a)?Pa.e(a,b,c):c:c}function b(a,b){return null==a?null:a&&(a.j&256||a.Lb)?a.B(null,b):a instanceof Array?b<a.length?a[b]:null:"string"===typeof a?b<a.length?a[b]:null:w(Oa,a)?Pa.d(a,b):null}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return b.call(this,c,e);case 3:return a.call(this,c,e,f)}throw Error("Invalid arity: "+
arguments.length);};c.d=b;c.e=a;return c}(),S=function(){function a(a,b,c){return null!=a?Sa(a,b,c):xc([b],[c])}var b=null,c=function(){function a(b,d,k,l){var m=null;3<arguments.length&&(m=L(Array.prototype.slice.call(arguments,3),0));return c.call(this,b,d,k,m)}function c(a,d,e,l){for(;;)if(a=b.e(a,d,e),u(l))d=F(l),e=sc(l),l=K(K(l));else return a}a.r=3;a.k=function(a){var b=F(a);a=K(a);var d=F(a);a=K(a);var l=F(a);a=G(a);return c(b,d,l,a)};a.g=c;return a}(),b=function(b,e,f,g){switch(arguments.length){case 3:return a.call(this,
b,e,f);default:return c.g(b,e,f,L(arguments,3))}throw Error("Invalid arity: "+arguments.length);};b.r=3;b.k=c.k;b.e=a;b.g=c.g;return b}(),yc=function(){function a(a,b){return null==a?null:Va(a,b)}var b=null,c=function(){function a(b,d,k){var l=null;2<arguments.length&&(l=L(Array.prototype.slice.call(arguments,2),0));return c.call(this,b,d,l)}function c(a,d,e){for(;;){if(null==a)return null;a=b.d(a,d);if(u(e))d=F(e),e=K(e);else return a}}a.r=2;a.k=function(a){var b=F(a);a=K(a);var d=F(a);a=G(a);return c(b,
d,a)};a.g=c;return a}(),b=function(b,e,f){switch(arguments.length){case 1:return b;case 2:return a.call(this,b,e);default:return c.g(b,e,L(arguments,2))}throw Error("Invalid arity: "+arguments.length);};b.r=2;b.k=c.k;b.c=function(a){return a};b.d=a;b.g=c.g;return b}();function Ac(a){var b="function"==q(a);return b?b:a?u(u(null)?null:a.oc)?!0:a.U?!1:w(ya,a):w(ya,a)}function Bc(a,b){this.h=a;this.meta=b;this.t=0;this.j=393217}h=Bc.prototype;
h.call=function(){function a(a,b,c,d,e,f,g,k,l,m,n,p,r,t,v,z,H,P,U,aa,J,xa){a=this;return T.ob?T.ob(a.h,b,c,d,e,f,g,k,l,m,n,p,r,t,v,z,H,P,U,aa,J,xa):T.call(null,a.h,b,c,d,e,f,g,k,l,m,n,p,r,t,v,z,H,P,U,aa,J,xa)}function b(a,b,c,d,e,f,g,k,l,m,n,p,r,t,v,z,H,P,U,aa,J){a=this;return a.h.Da?a.h.Da(b,c,d,e,f,g,k,l,m,n,p,r,t,v,z,H,P,U,aa,J):a.h.call(null,b,c,d,e,f,g,k,l,m,n,p,r,t,v,z,H,P,U,aa,J)}function c(a,b,c,d,e,f,g,k,l,m,n,p,r,t,v,z,H,P,U,aa){a=this;return a.h.Ca?a.h.Ca(b,c,d,e,f,g,k,l,m,n,p,r,t,v,z,
H,P,U,aa):a.h.call(null,b,c,d,e,f,g,k,l,m,n,p,r,t,v,z,H,P,U,aa)}function d(a,b,c,d,e,f,g,k,l,m,n,p,r,t,v,z,H,P,U){a=this;return a.h.Ba?a.h.Ba(b,c,d,e,f,g,k,l,m,n,p,r,t,v,z,H,P,U):a.h.call(null,b,c,d,e,f,g,k,l,m,n,p,r,t,v,z,H,P,U)}function e(a,b,c,d,e,f,g,k,l,m,n,p,r,t,v,z,H,P){a=this;return a.h.Aa?a.h.Aa(b,c,d,e,f,g,k,l,m,n,p,r,t,v,z,H,P):a.h.call(null,b,c,d,e,f,g,k,l,m,n,p,r,t,v,z,H,P)}function f(a,b,c,d,e,f,g,k,l,m,n,p,r,t,v,z,H){a=this;return a.h.za?a.h.za(b,c,d,e,f,g,k,l,m,n,p,r,t,v,z,H):a.h.call(null,
b,c,d,e,f,g,k,l,m,n,p,r,t,v,z,H)}function g(a,b,c,d,e,f,g,k,l,m,n,p,r,t,v,z){a=this;return a.h.ya?a.h.ya(b,c,d,e,f,g,k,l,m,n,p,r,t,v,z):a.h.call(null,b,c,d,e,f,g,k,l,m,n,p,r,t,v,z)}function k(a,b,c,d,e,f,g,k,l,m,n,p,r,t,v){a=this;return a.h.xa?a.h.xa(b,c,d,e,f,g,k,l,m,n,p,r,t,v):a.h.call(null,b,c,d,e,f,g,k,l,m,n,p,r,t,v)}function l(a,b,c,d,e,f,g,k,l,m,n,p,r,t){a=this;return a.h.wa?a.h.wa(b,c,d,e,f,g,k,l,m,n,p,r,t):a.h.call(null,b,c,d,e,f,g,k,l,m,n,p,r,t)}function m(a,b,c,d,e,f,g,k,l,m,n,p,r){a=this;
return a.h.va?a.h.va(b,c,d,e,f,g,k,l,m,n,p,r):a.h.call(null,b,c,d,e,f,g,k,l,m,n,p,r)}function n(a,b,c,d,e,f,g,k,l,m,n,p){a=this;return a.h.ua?a.h.ua(b,c,d,e,f,g,k,l,m,n,p):a.h.call(null,b,c,d,e,f,g,k,l,m,n,p)}function p(a,b,c,d,e,f,g,k,l,m,n){a=this;return a.h.ta?a.h.ta(b,c,d,e,f,g,k,l,m,n):a.h.call(null,b,c,d,e,f,g,k,l,m,n)}function r(a,b,c,d,e,f,g,k,l,m){a=this;return a.h.Fa?a.h.Fa(b,c,d,e,f,g,k,l,m):a.h.call(null,b,c,d,e,f,g,k,l,m)}function t(a,b,c,d,e,f,g,k,l){a=this;return a.h.Ea?a.h.Ea(b,c,
d,e,f,g,k,l):a.h.call(null,b,c,d,e,f,g,k,l)}function v(a,b,c,d,e,f,g,k){a=this;return a.h.ha?a.h.ha(b,c,d,e,f,g,k):a.h.call(null,b,c,d,e,f,g,k)}function z(a,b,c,d,e,f,g){a=this;return a.h.Y?a.h.Y(b,c,d,e,f,g):a.h.call(null,b,c,d,e,f,g)}function H(a,b,c,d,e,f){a=this;return a.h.v?a.h.v(b,c,d,e,f):a.h.call(null,b,c,d,e,f)}function P(a,b,c,d,e){a=this;return a.h.m?a.h.m(b,c,d,e):a.h.call(null,b,c,d,e)}function U(a,b,c,d){a=this;return a.h.e?a.h.e(b,c,d):a.h.call(null,b,c,d)}function aa(a,b,c){a=this;
return a.h.d?a.h.d(b,c):a.h.call(null,b,c)}function xa(a,b){a=this;return a.h.c?a.h.c(b):a.h.call(null,b)}function jb(a){a=this;return a.h.n?a.h.n():a.h.call(null)}var J=null,J=function(J,ea,pa,sa,wa,Ba,Ga,La,Ra,Ua,bb,ib,sb,Eb,Qb,ic,zc,gd,Td,gf,ah,Yi){switch(arguments.length){case 1:return jb.call(this,J);case 2:return xa.call(this,J,ea);case 3:return aa.call(this,J,ea,pa);case 4:return U.call(this,J,ea,pa,sa);case 5:return P.call(this,J,ea,pa,sa,wa);case 6:return H.call(this,J,ea,pa,sa,wa,Ba);case 7:return z.call(this,
J,ea,pa,sa,wa,Ba,Ga);case 8:return v.call(this,J,ea,pa,sa,wa,Ba,Ga,La);case 9:return t.call(this,J,ea,pa,sa,wa,Ba,Ga,La,Ra);case 10:return r.call(this,J,ea,pa,sa,wa,Ba,Ga,La,Ra,Ua);case 11:return p.call(this,J,ea,pa,sa,wa,Ba,Ga,La,Ra,Ua,bb);case 12:return n.call(this,J,ea,pa,sa,wa,Ba,Ga,La,Ra,Ua,bb,ib);case 13:return m.call(this,J,ea,pa,sa,wa,Ba,Ga,La,Ra,Ua,bb,ib,sb);case 14:return l.call(this,J,ea,pa,sa,wa,Ba,Ga,La,Ra,Ua,bb,ib,sb,Eb);case 15:return k.call(this,J,ea,pa,sa,wa,Ba,Ga,La,Ra,Ua,bb,ib,
sb,Eb,Qb);case 16:return g.call(this,J,ea,pa,sa,wa,Ba,Ga,La,Ra,Ua,bb,ib,sb,Eb,Qb,ic);case 17:return f.call(this,J,ea,pa,sa,wa,Ba,Ga,La,Ra,Ua,bb,ib,sb,Eb,Qb,ic,zc);case 18:return e.call(this,J,ea,pa,sa,wa,Ba,Ga,La,Ra,Ua,bb,ib,sb,Eb,Qb,ic,zc,gd);case 19:return d.call(this,J,ea,pa,sa,wa,Ba,Ga,La,Ra,Ua,bb,ib,sb,Eb,Qb,ic,zc,gd,Td);case 20:return c.call(this,J,ea,pa,sa,wa,Ba,Ga,La,Ra,Ua,bb,ib,sb,Eb,Qb,ic,zc,gd,Td,gf);case 21:return b.call(this,J,ea,pa,sa,wa,Ba,Ga,La,Ra,Ua,bb,ib,sb,Eb,Qb,ic,zc,gd,Td,gf,
ah);case 22:return a.call(this,J,ea,pa,sa,wa,Ba,Ga,La,Ra,Ua,bb,ib,sb,Eb,Qb,ic,zc,gd,Td,gf,ah,Yi)}throw Error("Invalid arity: "+arguments.length);};J.c=jb;J.d=xa;J.e=aa;J.m=U;J.v=P;J.Y=H;J.ha=z;J.Ea=v;J.Fa=t;J.ta=r;J.ua=p;J.va=n;J.wa=m;J.xa=l;J.ya=k;J.za=g;J.Aa=f;J.Ba=e;J.Ca=d;J.Da=c;J.vc=b;J.ob=a;return J}();h.apply=function(a,b){return this.call.apply(this,[this].concat(ra(b)))};h.n=function(){return this.h.n?this.h.n():this.h.call(null)};
h.c=function(a){return this.h.c?this.h.c(a):this.h.call(null,a)};h.d=function(a,b){return this.h.d?this.h.d(a,b):this.h.call(null,a,b)};h.e=function(a,b,c){return this.h.e?this.h.e(a,b,c):this.h.call(null,a,b,c)};h.m=function(a,b,c,d){return this.h.m?this.h.m(a,b,c,d):this.h.call(null,a,b,c,d)};h.v=function(a,b,c,d,e){return this.h.v?this.h.v(a,b,c,d,e):this.h.call(null,a,b,c,d,e)};h.Y=function(a,b,c,d,e,f){return this.h.Y?this.h.Y(a,b,c,d,e,f):this.h.call(null,a,b,c,d,e,f)};
h.ha=function(a,b,c,d,e,f,g){return this.h.ha?this.h.ha(a,b,c,d,e,f,g):this.h.call(null,a,b,c,d,e,f,g)};h.Ea=function(a,b,c,d,e,f,g,k){return this.h.Ea?this.h.Ea(a,b,c,d,e,f,g,k):this.h.call(null,a,b,c,d,e,f,g,k)};h.Fa=function(a,b,c,d,e,f,g,k,l){return this.h.Fa?this.h.Fa(a,b,c,d,e,f,g,k,l):this.h.call(null,a,b,c,d,e,f,g,k,l)};h.ta=function(a,b,c,d,e,f,g,k,l,m){return this.h.ta?this.h.ta(a,b,c,d,e,f,g,k,l,m):this.h.call(null,a,b,c,d,e,f,g,k,l,m)};
h.ua=function(a,b,c,d,e,f,g,k,l,m,n){return this.h.ua?this.h.ua(a,b,c,d,e,f,g,k,l,m,n):this.h.call(null,a,b,c,d,e,f,g,k,l,m,n)};h.va=function(a,b,c,d,e,f,g,k,l,m,n,p){return this.h.va?this.h.va(a,b,c,d,e,f,g,k,l,m,n,p):this.h.call(null,a,b,c,d,e,f,g,k,l,m,n,p)};h.wa=function(a,b,c,d,e,f,g,k,l,m,n,p,r){return this.h.wa?this.h.wa(a,b,c,d,e,f,g,k,l,m,n,p,r):this.h.call(null,a,b,c,d,e,f,g,k,l,m,n,p,r)};
h.xa=function(a,b,c,d,e,f,g,k,l,m,n,p,r,t){return this.h.xa?this.h.xa(a,b,c,d,e,f,g,k,l,m,n,p,r,t):this.h.call(null,a,b,c,d,e,f,g,k,l,m,n,p,r,t)};h.ya=function(a,b,c,d,e,f,g,k,l,m,n,p,r,t,v){return this.h.ya?this.h.ya(a,b,c,d,e,f,g,k,l,m,n,p,r,t,v):this.h.call(null,a,b,c,d,e,f,g,k,l,m,n,p,r,t,v)};h.za=function(a,b,c,d,e,f,g,k,l,m,n,p,r,t,v,z){return this.h.za?this.h.za(a,b,c,d,e,f,g,k,l,m,n,p,r,t,v,z):this.h.call(null,a,b,c,d,e,f,g,k,l,m,n,p,r,t,v,z)};
h.Aa=function(a,b,c,d,e,f,g,k,l,m,n,p,r,t,v,z,H){return this.h.Aa?this.h.Aa(a,b,c,d,e,f,g,k,l,m,n,p,r,t,v,z,H):this.h.call(null,a,b,c,d,e,f,g,k,l,m,n,p,r,t,v,z,H)};h.Ba=function(a,b,c,d,e,f,g,k,l,m,n,p,r,t,v,z,H,P){return this.h.Ba?this.h.Ba(a,b,c,d,e,f,g,k,l,m,n,p,r,t,v,z,H,P):this.h.call(null,a,b,c,d,e,f,g,k,l,m,n,p,r,t,v,z,H,P)};
h.Ca=function(a,b,c,d,e,f,g,k,l,m,n,p,r,t,v,z,H,P,U){return this.h.Ca?this.h.Ca(a,b,c,d,e,f,g,k,l,m,n,p,r,t,v,z,H,P,U):this.h.call(null,a,b,c,d,e,f,g,k,l,m,n,p,r,t,v,z,H,P,U)};h.Da=function(a,b,c,d,e,f,g,k,l,m,n,p,r,t,v,z,H,P,U,aa){return this.h.Da?this.h.Da(a,b,c,d,e,f,g,k,l,m,n,p,r,t,v,z,H,P,U,aa):this.h.call(null,a,b,c,d,e,f,g,k,l,m,n,p,r,t,v,z,H,P,U,aa)};
h.vc=function(a,b,c,d,e,f,g,k,l,m,n,p,r,t,v,z,H,P,U,aa,xa){return T.ob?T.ob(this.h,a,b,c,d,e,f,g,k,l,m,n,p,r,t,v,z,H,P,U,aa,xa):T.call(null,this.h,a,b,c,d,e,f,g,k,l,m,n,p,r,t,v,z,H,P,U,aa,xa)};h.oc=!0;h.I=function(a,b){return new Bc(this.h,b)};h.G=function(){return this.meta};function qc(a,b){return Ac(a)&&!(a?a.j&262144||a.vd||(a.j?0:w(gb,a)):w(gb,a))?new Bc(a,b):null==a?null:hb(a,b)}function Cc(a){var b=null!=a;return(b?a?a.j&131072||a.xc||(a.j?0:w(eb,a)):w(eb,a):b)?fb(a):null}
var Dc=function(){function a(a,b){return null==a?null:$a(a,b)}var b=null,c=function(){function a(b,d,k){var l=null;2<arguments.length&&(l=L(Array.prototype.slice.call(arguments,2),0));return c.call(this,b,d,l)}function c(a,d,e){for(;;){if(null==a)return null;a=b.d(a,d);if(u(e))d=F(e),e=K(e);else return a}}a.r=2;a.k=function(a){var b=F(a);a=K(a);var d=F(a);a=G(a);return c(b,d,a)};a.g=c;return a}(),b=function(b,e,f){switch(arguments.length){case 1:return b;case 2:return a.call(this,b,e);default:return c.g(b,
e,L(arguments,2))}throw Error("Invalid arity: "+arguments.length);};b.r=2;b.k=c.k;b.c=function(a){return a};b.d=a;b.g=c.g;return b}();function Ec(a){return null==a||na(E(a))}function Fc(a){return null==a?!1:a?a.j&8||a.ld?!0:a.j?!1:w(Fa,a):w(Fa,a)}function Gc(a){return null==a?!1:a?a.j&4096||a.sd?!0:a.j?!1:w(Za,a):w(Za,a)}function Hc(a){return a?a.j&16777216||a.rd?!0:a.j?!1:w(qb,a):w(qb,a)}function Ic(a){return null==a?!1:a?a.j&1024||a.pd?!0:a.j?!1:w(Ta,a):w(Ta,a)}
function Jc(a){return a?a.j&16384||a.ud?!0:a.j?!1:w(ab,a):w(ab,a)}function Kc(a){return a?a.t&512||a.jd?!0:!1:!1}function Lc(a){var b=[];da(a,function(a){return function(b,e){return a.push(e)}}(b));return b}function Mc(a,b,c,d,e){for(;0!==e;)c[d]=a[b],d+=1,e-=1,b+=1}var Nc={};function Oc(a){return null==a?!1:a?a.j&64||a.gb?!0:a.j?!1:w(Ja,a):w(Ja,a)}function Pc(a){return u(a)?!0:!1}function Qc(a,b){return R.e(a,b,Nc)===Nc?!1:!0}
function $b(a,b){if(a===b)return 0;if(null==a)return-1;if(null==b)return 1;if(oa(a)===oa(b))return a&&(a.t&2048||a.mb)?a.nb(null,b):a>b?1:a<b?-1:0;throw Error("compare on non-nil objects of different types");}
var Rc=function(){function a(a,b,c,g){for(;;){var k=$b(Q.d(a,g),Q.d(b,g));if(0===k&&g+1<c)g+=1;else return k}}function b(a,b){var f=O(a),g=O(b);return f<g?-1:f>g?1:c.m(a,b,f,0)}var c=null,c=function(c,e,f,g){switch(arguments.length){case 2:return b.call(this,c,e);case 4:return a.call(this,c,e,f,g)}throw Error("Invalid arity: "+arguments.length);};c.d=b;c.m=a;return c}(),rc=function(){function a(a,b,c){for(c=E(c);;)if(c){b=a.d?a.d(b,F(c)):a.call(null,b,F(c));if(hc(b))return db(b);c=K(c)}else return b}
function b(a,b){var c=E(b);return c?ua.e?ua.e(a,F(c),K(c)):ua.call(null,a,F(c),K(c)):a.n?a.n():a.call(null)}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return b.call(this,c,e);case 3:return a.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.d=b;c.e=a;return c}(),ua=function(){function a(a,b,c){return c&&(c.j&524288||c.zc)?c.W(null,a,b):c instanceof Array?kc.e(c,a,b):"string"===typeof c?kc.e(c,a,b):w(kb,c)?lb.e(c,a,b):rc.e(a,b,c)}function b(a,b){return b&&(b.j&
524288||b.zc)?b.V(null,a):b instanceof Array?kc.d(b,a):"string"===typeof b?kc.d(b,a):w(kb,b)?lb.d(b,a):rc.d(a,b)}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return b.call(this,c,e);case 3:return a.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.d=b;c.e=a;return c}();
function Sc(a){return function(){function b(b,c){return a.d?a.d(b,c):a.call(null,b,c)}function c(){return a.n?a.n():a.call(null)}var d=null,d=function(a,d){switch(arguments.length){case 0:return c.call(this);case 1:return a;case 2:return b.call(this,a,d)}throw Error("Invalid arity: "+arguments.length);};d.n=c;d.c=function(a){return a};d.d=b;return d}()}
var Tc=function(){function a(a,b,c,g){a=a.c?a.c(Sc(b)):a.call(null,Sc(b));c=ua.e(a,c,g);c=a.c?a.c(hc(c)?db(c):c):a.call(null,hc(c)?db(c):c);return hc(c)?db(c):c}function b(a,b,f){return c.m(a,b,b.n?b.n():b.call(null),f)}var c=null,c=function(c,e,f,g){switch(arguments.length){case 3:return b.call(this,c,e,f);case 4:return a.call(this,c,e,f,g)}throw Error("Invalid arity: "+arguments.length);};c.e=b;c.m=a;return c}();function Uc(a){return a-1}
function Vc(a){a=(a-a%2)/2;return 0<=a?Math.floor.c?Math.floor.c(a):Math.floor.call(null,a):Math.ceil.c?Math.ceil.c(a):Math.ceil.call(null,a)}function Wc(a){a-=a>>1&1431655765;a=(a&858993459)+(a>>2&858993459);return 16843009*(a+(a>>4)&252645135)>>24}function Xc(a){var b=1;for(a=E(a);;)if(a&&0<b)b-=1,a=K(a);else return a}
var y=function(){function a(a){return null==a?"":a.toString()}var b=null,c=function(){function a(b,d){var k=null;1<arguments.length&&(k=L(Array.prototype.slice.call(arguments,1),0));return c.call(this,b,k)}function c(a,d){for(var e=new fa(b.c(a)),l=d;;)if(u(l))e=e.append(b.c(F(l))),l=K(l);else return e.toString()}a.r=1;a.k=function(a){var b=F(a);a=G(a);return c(b,a)};a.g=c;return a}(),b=function(b,e){switch(arguments.length){case 0:return"";case 1:return a.call(this,b);default:return c.g(b,L(arguments,
1))}throw Error("Invalid arity: "+arguments.length);};b.r=1;b.k=c.k;b.n=function(){return""};b.c=a;b.g=c.g;return b}();function oc(a,b){var c;if(Hc(b))a:{c=E(a);for(var d=E(b);;){if(null==c){c=null==d;break a}if(null!=d&&C.d(F(c),F(d)))c=K(c),d=K(d);else{c=!1;break a}}c=void 0}else c=null;return Pc(c)}function Yc(a,b,c,d,e){this.meta=a;this.first=b;this.pa=c;this.count=d;this.o=e;this.j=65937646;this.t=8192}h=Yc.prototype;h.toString=function(){return Nb(this)};h.G=function(){return this.meta};
h.ca=function(){return new Yc(this.meta,this.first,this.pa,this.count,this.o)};h.aa=function(){return 1===this.count?null:this.pa};h.Q=function(){return this.count};h.K=function(){var a=this.o;return null!=a?a:this.o=a=dc(this)};h.F=function(a,b){return oc(this,b)};h.R=function(){return I};h.V=function(a,b){return rc.d(b,this)};h.W=function(a,b,c){return rc.e(b,c,this)};h.X=function(){return this.first};h.ba=function(){return 1===this.count?I:this.pa};h.N=function(){return this};
h.I=function(a,b){return new Yc(b,this.first,this.pa,this.count,this.o)};h.P=function(a,b){return new Yc(this.meta,b,this,this.count+1,null)};function Zc(a){this.meta=a;this.j=65937614;this.t=8192}h=Zc.prototype;h.toString=function(){return Nb(this)};h.G=function(){return this.meta};h.ca=function(){return new Zc(this.meta)};h.aa=function(){return null};h.Q=function(){return 0};h.K=function(){return 0};h.F=function(a,b){return oc(this,b)};h.R=function(){return this};
h.V=function(a,b){return rc.d(b,this)};h.W=function(a,b,c){return rc.e(b,c,this)};h.X=function(){return null};h.ba=function(){return I};h.N=function(){return null};h.I=function(a,b){return new Zc(b)};h.P=function(a,b){return new Yc(this.meta,b,null,1,null)};var I=new Zc(null);function $c(a){return(a?a.j&134217728||a.qd||(a.j?0:w(rb,a)):w(rb,a))?tb(a):ua.e(uc,I,a)}
var ad=function(){function a(a){var d=null;0<arguments.length&&(d=L(Array.prototype.slice.call(arguments,0),0));return b.call(this,d)}function b(a){var b;if(a instanceof bc&&0===a.i)b=a.f;else a:{for(b=[];;)if(null!=a)b.push(a.X(null)),a=a.aa(null);else break a;b=void 0}a=b.length;for(var e=I;;)if(0<a){var f=a-1,e=e.P(null,b[a-1]);a=f}else return e}a.r=0;a.k=function(a){a=E(a);return b(a)};a.g=b;return a}();
function bd(a,b,c,d){this.meta=a;this.first=b;this.pa=c;this.o=d;this.j=65929452;this.t=8192}h=bd.prototype;h.toString=function(){return Nb(this)};h.G=function(){return this.meta};h.ca=function(){return new bd(this.meta,this.first,this.pa,this.o)};h.aa=function(){return null==this.pa?null:E(this.pa)};h.K=function(){var a=this.o;return null!=a?a:this.o=a=dc(this)};h.F=function(a,b){return oc(this,b)};h.R=function(){return qc(I,this.meta)};h.V=function(a,b){return rc.d(b,this)};
h.W=function(a,b,c){return rc.e(b,c,this)};h.X=function(){return this.first};h.ba=function(){return null==this.pa?I:this.pa};h.N=function(){return this};h.I=function(a,b){return new bd(b,this.first,this.pa,this.o)};h.P=function(a,b){return new bd(null,b,this,this.o)};function N(a,b){var c=null==b;return(c?c:b&&(b.j&64||b.gb))?new bd(null,a,b,null):new bd(null,a,E(b),null)}function V(a,b,c,d){this.fa=a;this.name=b;this.ra=c;this.Va=d;this.j=2153775105;this.t=4096}h=V.prototype;
h.H=function(a,b){return B(b,":"+y.c(this.ra))};h.K=function(){var a=this.Va;return null!=a?a:this.Va=a=Yb(Tb(this.name),Wb(this.fa))+2654435769|0};h.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return R.d(c,this);case 3:return R.e(c,this,d)}throw Error("Invalid arity: "+arguments.length);};a.d=function(a,c){return R.d(c,this)};a.e=function(a,c,d){return R.e(c,this,d)};return a}();h.apply=function(a,b){return this.call.apply(this,[this].concat(ra(b)))};
h.c=function(a){return R.d(a,this)};h.d=function(a,b){return R.e(a,this,b)};h.F=function(a,b){return b instanceof V?this.ra===b.ra:!1};h.toString=function(){return":"+y.c(this.ra)};function cd(a,b){return a===b?!0:a instanceof V&&b instanceof V?a.ra===b.ra:!1}
var ed=function(){function a(a,b){return new V(a,b,""+y.c(u(a)?""+y.c(a)+"/":null)+y.c(b),null)}function b(a){if(a instanceof V)return a;if(a instanceof D){var b;if(a&&(a.t&4096||a.yc))b=a.fa;else throw Error("Doesn't support namespace: "+y.c(a));return new V(b,dd.c?dd.c(a):dd.call(null,a),a.Na,null)}return"string"===typeof a?(b=a.split("/"),2===b.length?new V(b[0],b[1],a,null):new V(null,b[0],a,null)):null}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,c);case 2:return a.call(this,
c,e)}throw Error("Invalid arity: "+arguments.length);};c.c=b;c.d=a;return c}();function fd(a,b,c,d){this.meta=a;this.ab=b;this.s=c;this.o=d;this.t=0;this.j=32374988}h=fd.prototype;h.toString=function(){return Nb(this)};function hd(a){null!=a.ab&&(a.s=a.ab.n?a.ab.n():a.ab.call(null),a.ab=null);return a.s}h.G=function(){return this.meta};h.aa=function(){pb(this);return null==this.s?null:K(this.s)};h.K=function(){var a=this.o;return null!=a?a:this.o=a=dc(this)};h.F=function(a,b){return oc(this,b)};
h.R=function(){return qc(I,this.meta)};h.V=function(a,b){return rc.d(b,this)};h.W=function(a,b,c){return rc.e(b,c,this)};h.X=function(){pb(this);return null==this.s?null:F(this.s)};h.ba=function(){pb(this);return null!=this.s?G(this.s):I};h.N=function(){hd(this);if(null==this.s)return null;for(var a=this.s;;)if(a instanceof fd)a=hd(a);else return this.s=a,E(this.s)};h.I=function(a,b){return new fd(b,this.ab,this.s,this.o)};h.P=function(a,b){return N(b,this)};
function id(a,b){this.w=a;this.end=b;this.t=0;this.j=2}id.prototype.Q=function(){return this.end};id.prototype.add=function(a){this.w[this.end]=a;return this.end+=1};id.prototype.M=function(){var a=new jd(this.w,0,this.end);this.w=null;return a};function kd(a){return new id(Array(a),0)}function jd(a,b,c){this.f=a;this.off=b;this.end=c;this.t=0;this.j=524306}h=jd.prototype;h.V=function(a,b){return kc.m(this.f,b,this.f[this.off],this.off+1)};h.W=function(a,b,c){return kc.m(this.f,b,c,this.off)};
h.Jb=function(){if(this.off===this.end)throw Error("-drop-first of empty chunk");return new jd(this.f,this.off+1,this.end)};h.L=function(a,b){return this.f[this.off+b]};h.$=function(a,b,c){return 0<=b&&b<this.end-this.off?this.f[this.off+b]:c};h.Q=function(){return this.end-this.off};
var ld=function(){function a(a,b,c){return new jd(a,b,c)}function b(a,b){return new jd(a,b,a.length)}function c(a){return new jd(a,0,a.length)}var d=null,d=function(d,f,g){switch(arguments.length){case 1:return c.call(this,d);case 2:return b.call(this,d,f);case 3:return a.call(this,d,f,g)}throw Error("Invalid arity: "+arguments.length);};d.c=c;d.d=b;d.e=a;return d}();function md(a,b,c,d){this.M=a;this.sa=b;this.meta=c;this.o=d;this.j=31850732;this.t=1536}h=md.prototype;h.toString=function(){return Nb(this)};
h.G=function(){return this.meta};h.aa=function(){if(1<Da(this.M))return new md(Fb(this.M),this.sa,this.meta,null);var a=pb(this.sa);return null==a?null:a};h.K=function(){var a=this.o;return null!=a?a:this.o=a=dc(this)};h.F=function(a,b){return oc(this,b)};h.R=function(){return qc(I,this.meta)};h.X=function(){return A.d(this.M,0)};h.ba=function(){return 1<Da(this.M)?new md(Fb(this.M),this.sa,this.meta,null):null==this.sa?I:this.sa};h.N=function(){return this};h.Ab=function(){return this.M};
h.Bb=function(){return null==this.sa?I:this.sa};h.I=function(a,b){return new md(this.M,this.sa,b,this.o)};h.P=function(a,b){return N(b,this)};h.zb=function(){return null==this.sa?null:this.sa};function nd(a,b){return 0===Da(a)?b:new md(a,b,null,null)}function od(a,b){a.add(b)}function pd(a){for(var b=[];;)if(E(a))b.push(F(a)),a=K(a);else return b}function qd(a,b){if(lc(a))return O(a);for(var c=a,d=b,e=0;;)if(0<d&&E(c))c=K(c),d-=1,e+=1;else return e}
var sd=function rd(b){return null==b?null:null==K(b)?E(F(b)):N(F(b),rd(K(b)))},td=function(){function a(a,b){return new fd(null,function(){var c=E(a);return c?Kc(c)?nd(Gb(c),d.d(Hb(c),b)):N(F(c),d.d(G(c),b)):b},null,null)}function b(a){return new fd(null,function(){return a},null,null)}function c(){return new fd(null,function(){return null},null,null)}var d=null,e=function(){function a(c,d,e){var f=null;2<arguments.length&&(f=L(Array.prototype.slice.call(arguments,2),0));return b.call(this,c,d,f)}
function b(a,c,e){return function p(a,b){return new fd(null,function(){var c=E(a);return c?Kc(c)?nd(Gb(c),p(Hb(c),b)):N(F(c),p(G(c),b)):u(b)?p(F(b),K(b)):null},null,null)}(d.d(a,c),e)}a.r=2;a.k=function(a){var c=F(a);a=K(a);var d=F(a);a=G(a);return b(c,d,a)};a.g=b;return a}(),d=function(d,g,k){switch(arguments.length){case 0:return c.call(this);case 1:return b.call(this,d);case 2:return a.call(this,d,g);default:return e.g(d,g,L(arguments,2))}throw Error("Invalid arity: "+arguments.length);};d.r=2;
d.k=e.k;d.n=c;d.c=b;d.d=a;d.g=e.g;return d}(),ud=function(){function a(a,b,c,d){return N(a,N(b,N(c,d)))}function b(a,b,c){return N(a,N(b,c))}var c=null,d=function(){function a(c,d,e,m,n){var p=null;4<arguments.length&&(p=L(Array.prototype.slice.call(arguments,4),0));return b.call(this,c,d,e,m,p)}function b(a,c,d,e,f){return N(a,N(c,N(d,N(e,sd(f)))))}a.r=4;a.k=function(a){var c=F(a);a=K(a);var d=F(a);a=K(a);var e=F(a);a=K(a);var n=F(a);a=G(a);return b(c,d,e,n,a)};a.g=b;return a}(),c=function(c,f,g,
k,l){switch(arguments.length){case 1:return E(c);case 2:return N(c,f);case 3:return b.call(this,c,f,g);case 4:return a.call(this,c,f,g,k);default:return d.g(c,f,g,k,L(arguments,4))}throw Error("Invalid arity: "+arguments.length);};c.r=4;c.k=d.k;c.c=function(a){return E(a)};c.d=function(a,b){return N(a,b)};c.e=b;c.m=a;c.g=d.g;return c}(),vd=function(){var a=null,b=function(){function a(c,f,g,k){var l=null;3<arguments.length&&(l=L(Array.prototype.slice.call(arguments,3),0));return b.call(this,c,f,g,
l)}function b(a,c,d,k){for(;;)if(a=Cb(a,c,d),u(k))c=F(k),d=sc(k),k=K(K(k));else return a}a.r=3;a.k=function(a){var c=F(a);a=K(a);var g=F(a);a=K(a);var k=F(a);a=G(a);return b(c,g,k,a)};a.g=b;return a}(),a=function(a,d,e,f){switch(arguments.length){case 3:return Cb(a,d,e);default:return b.g(a,d,e,L(arguments,3))}throw Error("Invalid arity: "+arguments.length);};a.r=3;a.k=b.k;a.e=function(a,b,e){return Cb(a,b,e)};a.g=b.g;return a}();
function wd(a,b,c){var d=E(c);if(0===b)return a.n?a.n():a.call(null);c=Ka(d);var e=Ma(d);if(1===b)return a.c?a.c(c):a.c?a.c(c):a.call(null,c);var d=Ka(e),f=Ma(e);if(2===b)return a.d?a.d(c,d):a.d?a.d(c,d):a.call(null,c,d);var e=Ka(f),g=Ma(f);if(3===b)return a.e?a.e(c,d,e):a.e?a.e(c,d,e):a.call(null,c,d,e);var f=Ka(g),k=Ma(g);if(4===b)return a.m?a.m(c,d,e,f):a.m?a.m(c,d,e,f):a.call(null,c,d,e,f);var g=Ka(k),l=Ma(k);if(5===b)return a.v?a.v(c,d,e,f,g):a.v?a.v(c,d,e,f,g):a.call(null,c,d,e,f,g);var k=Ka(l),
m=Ma(l);if(6===b)return a.Y?a.Y(c,d,e,f,g,k):a.Y?a.Y(c,d,e,f,g,k):a.call(null,c,d,e,f,g,k);var l=Ka(m),n=Ma(m);if(7===b)return a.ha?a.ha(c,d,e,f,g,k,l):a.ha?a.ha(c,d,e,f,g,k,l):a.call(null,c,d,e,f,g,k,l);var m=Ka(n),p=Ma(n);if(8===b)return a.Ea?a.Ea(c,d,e,f,g,k,l,m):a.Ea?a.Ea(c,d,e,f,g,k,l,m):a.call(null,c,d,e,f,g,k,l,m);var n=Ka(p),r=Ma(p);if(9===b)return a.Fa?a.Fa(c,d,e,f,g,k,l,m,n):a.Fa?a.Fa(c,d,e,f,g,k,l,m,n):a.call(null,c,d,e,f,g,k,l,m,n);var p=Ka(r),t=Ma(r);if(10===b)return a.ta?a.ta(c,d,e,
f,g,k,l,m,n,p):a.ta?a.ta(c,d,e,f,g,k,l,m,n,p):a.call(null,c,d,e,f,g,k,l,m,n,p);var r=Ka(t),v=Ma(t);if(11===b)return a.ua?a.ua(c,d,e,f,g,k,l,m,n,p,r):a.ua?a.ua(c,d,e,f,g,k,l,m,n,p,r):a.call(null,c,d,e,f,g,k,l,m,n,p,r);var t=Ka(v),z=Ma(v);if(12===b)return a.va?a.va(c,d,e,f,g,k,l,m,n,p,r,t):a.va?a.va(c,d,e,f,g,k,l,m,n,p,r,t):a.call(null,c,d,e,f,g,k,l,m,n,p,r,t);var v=Ka(z),H=Ma(z);if(13===b)return a.wa?a.wa(c,d,e,f,g,k,l,m,n,p,r,t,v):a.wa?a.wa(c,d,e,f,g,k,l,m,n,p,r,t,v):a.call(null,c,d,e,f,g,k,l,m,n,
p,r,t,v);var z=Ka(H),P=Ma(H);if(14===b)return a.xa?a.xa(c,d,e,f,g,k,l,m,n,p,r,t,v,z):a.xa?a.xa(c,d,e,f,g,k,l,m,n,p,r,t,v,z):a.call(null,c,d,e,f,g,k,l,m,n,p,r,t,v,z);var H=Ka(P),U=Ma(P);if(15===b)return a.ya?a.ya(c,d,e,f,g,k,l,m,n,p,r,t,v,z,H):a.ya?a.ya(c,d,e,f,g,k,l,m,n,p,r,t,v,z,H):a.call(null,c,d,e,f,g,k,l,m,n,p,r,t,v,z,H);var P=Ka(U),aa=Ma(U);if(16===b)return a.za?a.za(c,d,e,f,g,k,l,m,n,p,r,t,v,z,H,P):a.za?a.za(c,d,e,f,g,k,l,m,n,p,r,t,v,z,H,P):a.call(null,c,d,e,f,g,k,l,m,n,p,r,t,v,z,H,P);var U=
Ka(aa),xa=Ma(aa);if(17===b)return a.Aa?a.Aa(c,d,e,f,g,k,l,m,n,p,r,t,v,z,H,P,U):a.Aa?a.Aa(c,d,e,f,g,k,l,m,n,p,r,t,v,z,H,P,U):a.call(null,c,d,e,f,g,k,l,m,n,p,r,t,v,z,H,P,U);var aa=Ka(xa),jb=Ma(xa);if(18===b)return a.Ba?a.Ba(c,d,e,f,g,k,l,m,n,p,r,t,v,z,H,P,U,aa):a.Ba?a.Ba(c,d,e,f,g,k,l,m,n,p,r,t,v,z,H,P,U,aa):a.call(null,c,d,e,f,g,k,l,m,n,p,r,t,v,z,H,P,U,aa);xa=Ka(jb);jb=Ma(jb);if(19===b)return a.Ca?a.Ca(c,d,e,f,g,k,l,m,n,p,r,t,v,z,H,P,U,aa,xa):a.Ca?a.Ca(c,d,e,f,g,k,l,m,n,p,r,t,v,z,H,P,U,aa,xa):a.call(null,
c,d,e,f,g,k,l,m,n,p,r,t,v,z,H,P,U,aa,xa);var J=Ka(jb);Ma(jb);if(20===b)return a.Da?a.Da(c,d,e,f,g,k,l,m,n,p,r,t,v,z,H,P,U,aa,xa,J):a.Da?a.Da(c,d,e,f,g,k,l,m,n,p,r,t,v,z,H,P,U,aa,xa,J):a.call(null,c,d,e,f,g,k,l,m,n,p,r,t,v,z,H,P,U,aa,xa,J);throw Error("Only up to 20 arguments supported on functions");}
var T=function(){function a(a,b,c,d,e){b=ud.m(b,c,d,e);c=a.r;return a.k?(d=qd(b,c+1),d<=c?wd(a,d,b):a.k(b)):a.apply(a,pd(b))}function b(a,b,c,d){b=ud.e(b,c,d);c=a.r;return a.k?(d=qd(b,c+1),d<=c?wd(a,d,b):a.k(b)):a.apply(a,pd(b))}function c(a,b,c){b=ud.d(b,c);c=a.r;if(a.k){var d=qd(b,c+1);return d<=c?wd(a,d,b):a.k(b)}return a.apply(a,pd(b))}function d(a,b){var c=a.r;if(a.k){var d=qd(b,c+1);return d<=c?wd(a,d,b):a.k(b)}return a.apply(a,pd(b))}var e=null,f=function(){function a(c,d,e,f,g,t){var v=null;
5<arguments.length&&(v=L(Array.prototype.slice.call(arguments,5),0));return b.call(this,c,d,e,f,g,v)}function b(a,c,d,e,f,g){c=N(c,N(d,N(e,N(f,sd(g)))));d=a.r;return a.k?(e=qd(c,d+1),e<=d?wd(a,e,c):a.k(c)):a.apply(a,pd(c))}a.r=5;a.k=function(a){var c=F(a);a=K(a);var d=F(a);a=K(a);var e=F(a);a=K(a);var f=F(a);a=K(a);var g=F(a);a=G(a);return b(c,d,e,f,g,a)};a.g=b;return a}(),e=function(e,k,l,m,n,p){switch(arguments.length){case 2:return d.call(this,e,k);case 3:return c.call(this,e,k,l);case 4:return b.call(this,
e,k,l,m);case 5:return a.call(this,e,k,l,m,n);default:return f.g(e,k,l,m,n,L(arguments,5))}throw Error("Invalid arity: "+arguments.length);};e.r=5;e.k=f.k;e.d=d;e.e=c;e.m=b;e.v=a;e.g=f.g;return e}(),xd=function(){function a(a,b){return!C.d(a,b)}var b=null,c=function(){function a(c,d,k){var l=null;2<arguments.length&&(l=L(Array.prototype.slice.call(arguments,2),0));return b.call(this,c,d,l)}function b(a,c,d){return na(T.m(C,a,c,d))}a.r=2;a.k=function(a){var c=F(a);a=K(a);var d=F(a);a=G(a);return b(c,
d,a)};a.g=b;return a}(),b=function(b,e,f){switch(arguments.length){case 1:return!1;case 2:return a.call(this,b,e);default:return c.g(b,e,L(arguments,2))}throw Error("Invalid arity: "+arguments.length);};b.r=2;b.k=c.k;b.c=function(){return!1};b.d=a;b.g=c.g;return b}();function yd(a,b){for(;;){if(null==E(b))return!0;if(u(a.c?a.c(F(b)):a.call(null,F(b)))){var c=a,d=K(b);a=c;b=d}else return!1}}
function zd(a,b){for(;;)if(E(b)){var c=a.c?a.c(F(b)):a.call(null,F(b));if(u(c))return c;var c=a,d=K(b);a=c;b=d}else return null}function Ad(a){return a}
function Bd(a){return function(){function b(b,c){return na(a.d?a.d(b,c):a.call(null,b,c))}function c(b){return na(a.c?a.c(b):a.call(null,b))}function d(){return na(a.n?a.n():a.call(null))}var e=null,f=function(){function b(a,d,e){var f=null;2<arguments.length&&(f=L(Array.prototype.slice.call(arguments,2),0));return c.call(this,a,d,f)}function c(b,d,e){return na(T.m(a,b,d,e))}b.r=2;b.k=function(a){var b=F(a);a=K(a);var d=F(a);a=G(a);return c(b,d,a)};b.g=c;return b}(),e=function(a,e,l){switch(arguments.length){case 0:return d.call(this);
case 1:return c.call(this,a);case 2:return b.call(this,a,e);default:return f.g(a,e,L(arguments,2))}throw Error("Invalid arity: "+arguments.length);};e.r=2;e.k=f.k;e.n=d;e.c=c;e.d=b;e.g=f.g;return e}()}function Cd(){return function(){function a(a){0<arguments.length&&L(Array.prototype.slice.call(arguments,0),0);return!1}a.r=0;a.k=function(a){E(a);return!1};a.g=function(){return!1};return a}()}
var Dd=function(){function a(a,b,c){return function(){function d(k,l,m){return a.c?a.c(b.c?b.c(c.e?c.e(k,l,m):c.call(null,k,l,m)):b.call(null,c.e?c.e(k,l,m):c.call(null,k,l,m))):a.call(null,b.c?b.c(c.e?c.e(k,l,m):c.call(null,k,l,m)):b.call(null,c.e?c.e(k,l,m):c.call(null,k,l,m)))}function l(d,k){return a.c?a.c(b.c?b.c(c.d?c.d(d,k):c.call(null,d,k)):b.call(null,c.d?c.d(d,k):c.call(null,d,k))):a.call(null,b.c?b.c(c.d?c.d(d,k):c.call(null,d,k)):b.call(null,c.d?c.d(d,k):c.call(null,d,k)))}function m(d){return a.c?
a.c(b.c?b.c(c.c?c.c(d):c.call(null,d)):b.call(null,c.c?c.c(d):c.call(null,d))):a.call(null,b.c?b.c(c.c?c.c(d):c.call(null,d)):b.call(null,c.c?c.c(d):c.call(null,d)))}function n(){return a.c?a.c(b.c?b.c(c.n?c.n():c.call(null)):b.call(null,c.n?c.n():c.call(null))):a.call(null,b.c?b.c(c.n?c.n():c.call(null)):b.call(null,c.n?c.n():c.call(null)))}var p=null,r=function(){function d(a,b,c,e){var f=null;3<arguments.length&&(f=L(Array.prototype.slice.call(arguments,3),0));return k.call(this,a,b,c,f)}function k(d,
l,m,n){return a.c?a.c(b.c?b.c(T.v(c,d,l,m,n)):b.call(null,T.v(c,d,l,m,n))):a.call(null,b.c?b.c(T.v(c,d,l,m,n)):b.call(null,T.v(c,d,l,m,n)))}d.r=3;d.k=function(a){var b=F(a);a=K(a);var c=F(a);a=K(a);var d=F(a);a=G(a);return k(b,c,d,a)};d.g=k;return d}(),p=function(a,b,c,e){switch(arguments.length){case 0:return n.call(this);case 1:return m.call(this,a);case 2:return l.call(this,a,b);case 3:return d.call(this,a,b,c);default:return r.g(a,b,c,L(arguments,3))}throw Error("Invalid arity: "+arguments.length);
};p.r=3;p.k=r.k;p.n=n;p.c=m;p.d=l;p.e=d;p.g=r.g;return p}()}function b(a,b){return function(){function c(d,g,k){return a.c?a.c(b.e?b.e(d,g,k):b.call(null,d,g,k)):a.call(null,b.e?b.e(d,g,k):b.call(null,d,g,k))}function d(c,g){return a.c?a.c(b.d?b.d(c,g):b.call(null,c,g)):a.call(null,b.d?b.d(c,g):b.call(null,c,g))}function l(c){return a.c?a.c(b.c?b.c(c):b.call(null,c)):a.call(null,b.c?b.c(c):b.call(null,c))}function m(){return a.c?a.c(b.n?b.n():b.call(null)):a.call(null,b.n?b.n():b.call(null))}var n=
null,p=function(){function c(a,b,e,f){var g=null;3<arguments.length&&(g=L(Array.prototype.slice.call(arguments,3),0));return d.call(this,a,b,e,g)}function d(c,g,k,l){return a.c?a.c(T.v(b,c,g,k,l)):a.call(null,T.v(b,c,g,k,l))}c.r=3;c.k=function(a){var b=F(a);a=K(a);var c=F(a);a=K(a);var e=F(a);a=G(a);return d(b,c,e,a)};c.g=d;return c}(),n=function(a,b,e,f){switch(arguments.length){case 0:return m.call(this);case 1:return l.call(this,a);case 2:return d.call(this,a,b);case 3:return c.call(this,a,b,e);
default:return p.g(a,b,e,L(arguments,3))}throw Error("Invalid arity: "+arguments.length);};n.r=3;n.k=p.k;n.n=m;n.c=l;n.d=d;n.e=c;n.g=p.g;return n}()}var c=null,d=function(){function a(c,d,e,m){var n=null;3<arguments.length&&(n=L(Array.prototype.slice.call(arguments,3),0));return b.call(this,c,d,e,n)}function b(a,c,d,e){return function(a){return function(){function b(a){var d=null;0<arguments.length&&(d=L(Array.prototype.slice.call(arguments,0),0));return c.call(this,d)}function c(b){b=T.d(F(a),b);
for(var d=K(a);;)if(d)b=F(d).call(null,b),d=K(d);else return b}b.r=0;b.k=function(a){a=E(a);return c(a)};b.g=c;return b}()}($c(ud.m(a,c,d,e)))}a.r=3;a.k=function(a){var c=F(a);a=K(a);var d=F(a);a=K(a);var e=F(a);a=G(a);return b(c,d,e,a)};a.g=b;return a}(),c=function(c,f,g,k){switch(arguments.length){case 0:return Ad;case 1:return c;case 2:return b.call(this,c,f);case 3:return a.call(this,c,f,g);default:return d.g(c,f,g,L(arguments,3))}throw Error("Invalid arity: "+arguments.length);};c.r=3;c.k=d.k;
c.n=function(){return Ad};c.c=function(a){return a};c.d=b;c.e=a;c.g=d.g;return c}();function Ed(a,b,c,d){this.state=a;this.meta=b;this.gd=c;this.bb=d;this.j=6455296;this.t=16386}h=Ed.prototype;h.K=function(){return this[ba]||(this[ba]=++ca)};
h.Rb=function(a,b,c){a=E(this.bb);for(var d=null,e=0,f=0;;)if(f<e){var g=d.L(null,f),k=Q.e(g,0,null),g=Q.e(g,1,null);g.m?g.m(k,this,b,c):g.call(null,k,this,b,c);f+=1}else if(a=E(a))Kc(a)?(d=Gb(a),a=Hb(a),k=d,e=O(d),d=k):(d=F(a),k=Q.e(d,0,null),g=Q.e(d,1,null),g.m?g.m(k,this,b,c):g.call(null,k,this,b,c),a=K(a),d=null,e=0),f=0;else return null};h.Qb=function(a,b,c){this.bb=S.e(this.bb,b,c);return this};h.Sb=function(a,b){return this.bb=yc.d(this.bb,b)};h.G=function(){return this.meta};h.Pa=function(){return this.state};
h.F=function(a,b){return this===b};
var W=function(){function a(a){return new Ed(a,null,null,null)}var b=null,c=function(){function a(c,d){var k=null;1<arguments.length&&(k=L(Array.prototype.slice.call(arguments,1),0));return b.call(this,c,k)}function b(a,c){var d=Oc(c)?T.d(Fd,c):c,e=R.d(d,Gd),d=R.d(d,ka);return new Ed(a,d,e,null)}a.r=1;a.k=function(a){var c=F(a);a=G(a);return b(c,a)};a.g=b;return a}(),b=function(b,e){switch(arguments.length){case 1:return a.call(this,b);default:return c.g(b,L(arguments,1))}throw Error("Invalid arity: "+
arguments.length);};b.r=1;b.k=c.k;b.c=a;b.g=c.g;return b}();
function Hd(a,b){if(a instanceof Ed){var c=a.gd;if(null!=c&&!u(c.c?c.c(b):c.call(null,b)))throw Error("Assert failed: Validator rejected reference state\n"+y.c(Id.c?Id.c(ad(new D(null,"validate","validate",1439230700,null),new D(null,"new-value","new-value",-1567397401,null))):Id.call(null,ad(new D(null,"validate","validate",1439230700,null),new D(null,"new-value","new-value",-1567397401,null)))));c=a.state;a.state=b;null!=a.bb&&wb(a,c,b);return b}return Kb(a,b)}
var Jd=function(){function a(a,b,c,d){return a instanceof Ed?Hd(a,b.e?b.e(a.state,c,d):b.call(null,a.state,c,d)):Lb.m(a,b,c,d)}function b(a,b,c){return a instanceof Ed?Hd(a,b.d?b.d(a.state,c):b.call(null,a.state,c)):Lb.e(a,b,c)}function c(a,b){return a instanceof Ed?Hd(a,b.c?b.c(a.state):b.call(null,a.state)):Lb.d(a,b)}var d=null,e=function(){function a(c,d,e,f,p){var r=null;4<arguments.length&&(r=L(Array.prototype.slice.call(arguments,4),0));return b.call(this,c,d,e,f,r)}function b(a,c,d,e,f){return a instanceof
Ed?Hd(a,T.v(c,a.state,d,e,f)):Lb.v(a,c,d,e,f)}a.r=4;a.k=function(a){var c=F(a);a=K(a);var d=F(a);a=K(a);var e=F(a);a=K(a);var f=F(a);a=G(a);return b(c,d,e,f,a)};a.g=b;return a}(),d=function(d,g,k,l,m){switch(arguments.length){case 2:return c.call(this,d,g);case 3:return b.call(this,d,g,k);case 4:return a.call(this,d,g,k,l);default:return e.g(d,g,k,l,L(arguments,4))}throw Error("Invalid arity: "+arguments.length);};d.r=4;d.k=e.k;d.d=c;d.e=b;d.m=a;d.g=e.g;return d}(),Kd=function(){function a(a,b,c,
d){return new fd(null,function(){var f=E(b),p=E(c),r=E(d);return f&&p&&r?N(a.e?a.e(F(f),F(p),F(r)):a.call(null,F(f),F(p),F(r)),e.m(a,G(f),G(p),G(r))):null},null,null)}function b(a,b,c){return new fd(null,function(){var d=E(b),f=E(c);return d&&f?N(a.d?a.d(F(d),F(f)):a.call(null,F(d),F(f)),e.e(a,G(d),G(f))):null},null,null)}function c(a,b){return new fd(null,function(){var c=E(b);if(c){if(Kc(c)){for(var d=Gb(c),f=O(d),p=kd(f),r=0;;)if(r<f){var t=a.c?a.c(A.d(d,r)):a.call(null,A.d(d,r));p.add(t);r+=1}else break;
return nd(p.M(),e.d(a,Hb(c)))}return N(a.c?a.c(F(c)):a.call(null,F(c)),e.d(a,G(c)))}return null},null,null)}function d(a){return function(b){return function(){function c(d,e){return b.d?b.d(d,a.c?a.c(e):a.call(null,e)):b.call(null,d,a.c?a.c(e):a.call(null,e))}function d(a){return b.c?b.c(a):b.call(null,a)}function e(){return b.n?b.n():b.call(null)}var f=null,r=function(){function c(a,b,e){var f=null;2<arguments.length&&(f=L(Array.prototype.slice.call(arguments,2),0));return d.call(this,a,b,f)}function d(c,
e,f){return b.d?b.d(c,T.e(a,e,f)):b.call(null,c,T.e(a,e,f))}c.r=2;c.k=function(a){var b=F(a);a=K(a);var c=F(a);a=G(a);return d(b,c,a)};c.g=d;return c}(),f=function(a,b,f){switch(arguments.length){case 0:return e.call(this);case 1:return d.call(this,a);case 2:return c.call(this,a,b);default:return r.g(a,b,L(arguments,2))}throw Error("Invalid arity: "+arguments.length);};f.r=2;f.k=r.k;f.n=e;f.c=d;f.d=c;f.g=r.g;return f}()}}var e=null,f=function(){function a(c,d,e,f,g){var t=null;4<arguments.length&&
(t=L(Array.prototype.slice.call(arguments,4),0));return b.call(this,c,d,e,f,t)}function b(a,c,d,f,g){var k=function z(a){return new fd(null,function(){var b=e.d(E,a);return yd(Ad,b)?N(e.d(F,b),z(e.d(G,b))):null},null,null)};return e.d(function(){return function(b){return T.d(a,b)}}(k),k(uc.g(g,f,L([d,c],0))))}a.r=4;a.k=function(a){var c=F(a);a=K(a);var d=F(a);a=K(a);var e=F(a);a=K(a);var f=F(a);a=G(a);return b(c,d,e,f,a)};a.g=b;return a}(),e=function(e,k,l,m,n){switch(arguments.length){case 1:return d.call(this,
e);case 2:return c.call(this,e,k);case 3:return b.call(this,e,k,l);case 4:return a.call(this,e,k,l,m);default:return f.g(e,k,l,m,L(arguments,4))}throw Error("Invalid arity: "+arguments.length);};e.r=4;e.k=f.k;e.c=d;e.d=c;e.e=b;e.m=a;e.g=f.g;return e}(),Ld=function(){function a(a,b){return new fd(null,function(){if(0<a){var f=E(b);return f?N(F(f),c.d(a-1,G(f))):null}return null},null,null)}function b(a){return function(b){return function(a){return function(){function c(d,g){var k=db(a),l=Jd.d(a,Uc),
k=0<k?b.d?b.d(d,g):b.call(null,d,g):d;return 0<l?k:new gc(k)}function d(a){return b.c?b.c(a):b.call(null,a)}function l(){return b.n?b.n():b.call(null)}var m=null,m=function(a,b){switch(arguments.length){case 0:return l.call(this);case 1:return d.call(this,a);case 2:return c.call(this,a,b)}throw Error("Invalid arity: "+arguments.length);};m.n=l;m.c=d;m.d=c;return m}()}(W.c(a))}}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,c);case 2:return a.call(this,c,e)}throw Error("Invalid arity: "+
arguments.length);};c.c=b;c.d=a;return c}(),Md=function(){function a(a,b){return new fd(null,function(c){return function(){return c(a,b)}}(function(a,b){for(;;){var c=E(b);if(0<a&&c){var d=a-1,c=G(c);a=d;b=c}else return c}}),null,null)}function b(a){return function(b){return function(a){return function(){function c(d,g){var k=db(a);Jd.d(a,Uc);return 0<k?d:b.d?b.d(d,g):b.call(null,d,g)}function d(a){return b.c?b.c(a):b.call(null,a)}function l(){return b.n?b.n():b.call(null)}var m=null,m=function(a,
b){switch(arguments.length){case 0:return l.call(this);case 1:return d.call(this,a);case 2:return c.call(this,a,b)}throw Error("Invalid arity: "+arguments.length);};m.n=l;m.c=d;m.d=c;return m}()}(W.c(a))}}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,c);case 2:return a.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.c=b;c.d=a;return c}(),Nd=function(){function a(a,b){return Ld.d(a,c.c(b))}function b(a){return new fd(null,function(){return N(a,c.c(a))},
null,null)}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,c);case 2:return a.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.c=b;c.d=a;return c}(),Od=function(){function a(a,c){return new fd(null,function(){var f=E(a),g=E(c);return f&&g?N(F(f),N(F(g),b.d(G(f),G(g)))):null},null,null)}var b=null,c=function(){function a(b,d,k){var l=null;2<arguments.length&&(l=L(Array.prototype.slice.call(arguments,2),0));return c.call(this,b,d,l)}function c(a,d,e){return new fd(null,
function(){var c=Kd.d(E,uc.g(e,d,L([a],0)));return yd(Ad,c)?td.d(Kd.d(F,c),T.d(b,Kd.d(G,c))):null},null,null)}a.r=2;a.k=function(a){var b=F(a);a=K(a);var d=F(a);a=G(a);return c(b,d,a)};a.g=c;return a}(),b=function(b,e,f){switch(arguments.length){case 2:return a.call(this,b,e);default:return c.g(b,e,L(arguments,2))}throw Error("Invalid arity: "+arguments.length);};b.r=2;b.k=c.k;b.d=a;b.g=c.g;return b}();function Pd(a,b){return Md.d(1,Od.d(Nd.c(a),b))}
var Qd=function(){function a(a,b){return new fd(null,function(){var f=E(b);if(f){if(Kc(f)){for(var g=Gb(f),k=O(g),l=kd(k),m=0;;)if(m<k){if(u(a.c?a.c(A.d(g,m)):a.call(null,A.d(g,m)))){var n=A.d(g,m);l.add(n)}m+=1}else break;return nd(l.M(),c.d(a,Hb(f)))}g=F(f);f=G(f);return u(a.c?a.c(g):a.call(null,g))?N(g,c.d(a,f)):c.d(a,f)}return null},null,null)}function b(a){return function(b){return function(){function c(f,g){return u(a.c?a.c(g):a.call(null,g))?b.d?b.d(f,g):b.call(null,f,g):f}function g(a){return b.c?
b.c(a):b.call(null,a)}function k(){return b.n?b.n():b.call(null)}var l=null,l=function(a,b){switch(arguments.length){case 0:return k.call(this);case 1:return g.call(this,a);case 2:return c.call(this,a,b)}throw Error("Invalid arity: "+arguments.length);};l.n=k;l.c=g;l.d=c;return l}()}}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,c);case 2:return a.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.c=b;c.d=a;return c}(),Rd=function(){function a(a,b){return Qd.d(Bd(a),
b)}function b(a){return Qd.c(Bd(a))}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,c);case 2:return a.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.c=b;c.d=a;return c}(),Sd=function(){function a(a,b,c){a&&(a.t&4||a.qc)?(b=Tc.m(b,Ab,zb(a),c),b=Bb(b),a=qc(b,Cc(a))):a=Tc.m(b,uc,a,c);return a}function b(a,b){var c;null!=a?a&&(a.t&4||a.qc)?(c=ua.e(Ab,zb(a),b),c=Bb(c),c=qc(c,Cc(a))):c=ua.e(Ha,a,b):c=ua.e(uc,I,b);return c}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return b.call(this,
c,e);case 3:return a.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.d=b;c.e=a;return c}(),Ud=function(){function a(a,b,c){var g=Nc;for(b=E(b);;)if(b){var k=a;if(k?k.j&256||k.Lb||(k.j?0:w(Oa,k)):w(Oa,k)){a=R.e(a,F(b),g);if(g===a)return c;b=K(b)}else return c}else return a}function b(a,b){return c.e(a,b,null)}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return b.call(this,c,e);case 3:return a.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.d=
b;c.e=a;return c}(),Wd=function Vd(b,c,d){var e=Q.e(c,0,null);return(c=Xc(c))?S.e(b,e,Vd(R.d(b,e),c,d)):S.e(b,e,d)},Xd=function(){function a(a,b,c,d,f,p){var r=Q.e(b,0,null);return(b=Xc(b))?S.e(a,r,e.Y(R.d(a,r),b,c,d,f,p)):S.e(a,r,c.m?c.m(R.d(a,r),d,f,p):c.call(null,R.d(a,r),d,f,p))}function b(a,b,c,d,f){var p=Q.e(b,0,null);return(b=Xc(b))?S.e(a,p,e.v(R.d(a,p),b,c,d,f)):S.e(a,p,c.e?c.e(R.d(a,p),d,f):c.call(null,R.d(a,p),d,f))}function c(a,b,c,d){var f=Q.e(b,0,null);return(b=Xc(b))?S.e(a,f,e.m(R.d(a,
f),b,c,d)):S.e(a,f,c.d?c.d(R.d(a,f),d):c.call(null,R.d(a,f),d))}function d(a,b,c){var d=Q.e(b,0,null);return(b=Xc(b))?S.e(a,d,e.e(R.d(a,d),b,c)):S.e(a,d,c.c?c.c(R.d(a,d)):c.call(null,R.d(a,d)))}var e=null,f=function(){function a(c,d,e,f,g,t,v){var z=null;6<arguments.length&&(z=L(Array.prototype.slice.call(arguments,6),0));return b.call(this,c,d,e,f,g,t,z)}function b(a,c,d,f,g,k,v){var z=Q.e(c,0,null);return(c=Xc(c))?S.e(a,z,T.g(e,R.d(a,z),c,d,f,L([g,k,v],0))):S.e(a,z,T.g(d,R.d(a,z),f,g,k,L([v],0)))}
a.r=6;a.k=function(a){var c=F(a);a=K(a);var d=F(a);a=K(a);var e=F(a);a=K(a);var f=F(a);a=K(a);var g=F(a);a=K(a);var v=F(a);a=G(a);return b(c,d,e,f,g,v,a)};a.g=b;return a}(),e=function(e,k,l,m,n,p,r){switch(arguments.length){case 3:return d.call(this,e,k,l);case 4:return c.call(this,e,k,l,m);case 5:return b.call(this,e,k,l,m,n);case 6:return a.call(this,e,k,l,m,n,p);default:return f.g(e,k,l,m,n,p,L(arguments,6))}throw Error("Invalid arity: "+arguments.length);};e.r=6;e.k=f.k;e.e=d;e.m=c;e.v=b;e.Y=
a;e.g=f.g;return e}();function Yd(a,b){this.D=a;this.f=b}function Zd(a){return new Yd(a,[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null])}function $d(a){a=a.l;return 32>a?0:a-1>>>5<<5}function ae(a,b,c){for(;;){if(0===b)return c;var d=Zd(a);d.f[0]=c;c=d;b-=5}}
var ce=function be(b,c,d,e){var f=new Yd(d.D,ra(d.f)),g=b.l-1>>>c&31;5===c?f.f[g]=e:(d=d.f[g],b=null!=d?be(b,c-5,d,e):ae(null,c-5,e),f.f[g]=b);return f};function de(a,b){throw Error("No item "+y.c(a)+" in vector of length "+y.c(b));}function ee(a){var b=a.root;for(a=a.shift;;)if(0<a)a-=5,b=b.f[0];else return b.f}function fe(a,b){if(b>=$d(a))return a.A;for(var c=a.root,d=a.shift;;)if(0<d)var e=d-5,c=c.f[b>>>d&31],d=e;else return c.f}function ge(a,b){return 0<=b&&b<a.l?fe(a,b):de(b,a.l)}
var ie=function he(b,c,d,e,f){var g=new Yd(d.D,ra(d.f));if(0===c)g.f[e&31]=f;else{var k=e>>>c&31;b=he(b,c-5,d.f[k],e,f);g.f[k]=b}return g};function X(a,b,c,d,e,f){this.meta=a;this.l=b;this.shift=c;this.root=d;this.A=e;this.o=f;this.j=167668511;this.t=8196}h=X.prototype;h.toString=function(){return Nb(this)};h.B=function(a,b){return Pa.e(this,b,null)};h.C=function(a,b,c){return"number"===typeof b?A.e(this,b,c):c};h.L=function(a,b){return ge(this,b)[b&31]};
h.$=function(a,b,c){return 0<=b&&b<this.l?fe(this,b)[b&31]:c};h.Db=function(a,b,c){if(0<=b&&b<this.l)return $d(this)<=b?(a=ra(this.A),a[b&31]=c,new X(this.meta,this.l,this.shift,this.root,a,null)):new X(this.meta,this.l,this.shift,ie(this,this.shift,this.root,b,c),this.A,null);if(b===this.l)return Ha(this,c);throw Error("Index "+y.c(b)+" out of bounds  [0,"+y.c(this.l)+"]");};h.G=function(){return this.meta};h.ca=function(){return new X(this.meta,this.l,this.shift,this.root,this.A,this.o)};h.Q=function(){return this.l};
h.Cb=function(){return A.d(this,0)};h.Mb=function(){return A.d(this,1)};h.qb=function(){return 0<this.l?new nc(this,this.l-1,null):null};h.K=function(){var a=this.o;return null!=a?a:this.o=a=dc(this)};h.F=function(a,b){return oc(this,b)};h.fb=function(){return new je(this.l,this.shift,ke.c?ke.c(this.root):ke.call(null,this.root),le.c?le.c(this.A):le.call(null,this.A))};h.R=function(){return qc(tc,this.meta)};h.V=function(a,b){return jc.d(this,b)};h.W=function(a,b,c){return jc.e(this,b,c)};
h.Oa=function(a,b,c){if("number"===typeof b)return cb(this,b,c);throw Error("Vector's key for assoc must be a number.");};h.N=function(){return 0===this.l?null:32>=this.l?new bc(this.A,0):me.m?me.m(this,ee(this),0,0):me.call(null,this,ee(this),0,0)};h.I=function(a,b){return new X(b,this.l,this.shift,this.root,this.A,this.o)};
h.P=function(a,b){if(32>this.l-$d(this)){for(var c=this.A.length,d=Array(c+1),e=0;;)if(e<c)d[e]=this.A[e],e+=1;else break;d[c]=b;return new X(this.meta,this.l+1,this.shift,this.root,d,null)}c=(d=this.l>>>5>1<<this.shift)?this.shift+5:this.shift;d?(d=Zd(null),d.f[0]=this.root,e=ae(null,this.shift,new Yd(null,this.A)),d.f[1]=e):d=ce(this,this.shift,this.root,new Yd(null,this.A));return new X(this.meta,this.l+1,c,d,[b],null)};
h.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.L(null,c);case 3:return this.$(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.d=function(a,c){return this.L(null,c)};a.e=function(a,c,d){return this.$(null,c,d)};return a}();h.apply=function(a,b){return this.call.apply(this,[this].concat(ra(b)))};h.c=function(a){return this.L(null,a)};h.d=function(a,b){return this.$(null,a,b)};
var Y=new Yd(null,[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]),tc=new X(null,0,5,Y,[],0);function ne(a){return Bb(ua.e(Ab,zb(tc),a))}function oe(a,b,c,d,e,f){this.O=a;this.ja=b;this.i=c;this.off=d;this.meta=e;this.o=f;this.j=32243948;this.t=1536}h=oe.prototype;h.toString=function(){return Nb(this)};
h.aa=function(){if(this.off+1<this.ja.length){var a=me.m?me.m(this.O,this.ja,this.i,this.off+1):me.call(null,this.O,this.ja,this.i,this.off+1);return null==a?null:a}return Ib(this)};h.K=function(){var a=this.o;return null!=a?a:this.o=a=dc(this)};h.F=function(a,b){return oc(this,b)};h.R=function(){return qc(tc,this.meta)};h.V=function(a,b){return jc.d(pe.e?pe.e(this.O,this.i+this.off,O(this.O)):pe.call(null,this.O,this.i+this.off,O(this.O)),b)};
h.W=function(a,b,c){return jc.e(pe.e?pe.e(this.O,this.i+this.off,O(this.O)):pe.call(null,this.O,this.i+this.off,O(this.O)),b,c)};h.X=function(){return this.ja[this.off]};h.ba=function(){if(this.off+1<this.ja.length){var a=me.m?me.m(this.O,this.ja,this.i,this.off+1):me.call(null,this.O,this.ja,this.i,this.off+1);return null==a?I:a}return Hb(this)};h.N=function(){return this};h.Ab=function(){return ld.d(this.ja,this.off)};
h.Bb=function(){var a=this.i+this.ja.length;return a<Da(this.O)?me.m?me.m(this.O,fe(this.O,a),a,0):me.call(null,this.O,fe(this.O,a),a,0):I};h.I=function(a,b){return me.v?me.v(this.O,this.ja,this.i,this.off,b):me.call(null,this.O,this.ja,this.i,this.off,b)};h.P=function(a,b){return N(b,this)};h.zb=function(){var a=this.i+this.ja.length;return a<Da(this.O)?me.m?me.m(this.O,fe(this.O,a),a,0):me.call(null,this.O,fe(this.O,a),a,0):null};
var me=function(){function a(a,b,c,d,l){return new oe(a,b,c,d,l,null)}function b(a,b,c,d){return new oe(a,b,c,d,null,null)}function c(a,b,c){return new oe(a,ge(a,b),b,c,null,null)}var d=null,d=function(d,f,g,k,l){switch(arguments.length){case 3:return c.call(this,d,f,g);case 4:return b.call(this,d,f,g,k);case 5:return a.call(this,d,f,g,k,l)}throw Error("Invalid arity: "+arguments.length);};d.e=c;d.m=b;d.v=a;return d}();
function qe(a,b,c,d,e){this.meta=a;this.qa=b;this.start=c;this.end=d;this.o=e;this.j=166617887;this.t=8192}h=qe.prototype;h.toString=function(){return Nb(this)};h.B=function(a,b){return Pa.e(this,b,null)};h.C=function(a,b,c){return"number"===typeof b?A.e(this,b,c):c};h.L=function(a,b){return 0>b||this.end<=this.start+b?de(b,this.end-this.start):A.d(this.qa,this.start+b)};h.$=function(a,b,c){return 0>b||this.end<=this.start+b?c:A.e(this.qa,this.start+b,c)};
h.Db=function(a,b,c){var d=this,e=d.start+b;return re.v?re.v(d.meta,S.e(d.qa,e,c),d.start,function(){var a=d.end,b=e+1;return a>b?a:b}(),null):re.call(null,d.meta,S.e(d.qa,e,c),d.start,function(){var a=d.end,b=e+1;return a>b?a:b}(),null)};h.G=function(){return this.meta};h.ca=function(){return new qe(this.meta,this.qa,this.start,this.end,this.o)};h.Q=function(){return this.end-this.start};h.qb=function(){return this.start!==this.end?new nc(this,this.end-this.start-1,null):null};
h.K=function(){var a=this.o;return null!=a?a:this.o=a=dc(this)};h.F=function(a,b){return oc(this,b)};h.R=function(){return qc(tc,this.meta)};h.V=function(a,b){return jc.d(this,b)};h.W=function(a,b,c){return jc.e(this,b,c)};h.Oa=function(a,b,c){if("number"===typeof b)return cb(this,b,c);throw Error("Subvec's key for assoc must be a number.");};
h.N=function(){var a=this;return function(b){return function d(e){return e===a.end?null:N(A.d(a.qa,e),new fd(null,function(){return function(){return d(e+1)}}(b),null,null))}}(this)(a.start)};h.I=function(a,b){return re.v?re.v(b,this.qa,this.start,this.end,this.o):re.call(null,b,this.qa,this.start,this.end,this.o)};h.P=function(a,b){return re.v?re.v(this.meta,cb(this.qa,this.end,b),this.start,this.end+1,null):re.call(null,this.meta,cb(this.qa,this.end,b),this.start,this.end+1,null)};
h.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.L(null,c);case 3:return this.$(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.d=function(a,c){return this.L(null,c)};a.e=function(a,c,d){return this.$(null,c,d)};return a}();h.apply=function(a,b){return this.call.apply(this,[this].concat(ra(b)))};h.c=function(a){return this.L(null,a)};h.d=function(a,b){return this.$(null,a,b)};
function re(a,b,c,d,e){for(;;)if(b instanceof qe)c=b.start+c,d=b.start+d,b=b.qa;else{var f=O(b);if(0>c||0>d||c>f||d>f)throw Error("Index out of bounds");return new qe(a,b,c,d,e)}}var pe=function(){function a(a,b,c){return re(null,a,b,c,null)}function b(a,b){return c.e(a,b,O(a))}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return b.call(this,c,e);case 3:return a.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.d=b;c.e=a;return c}();
function se(a,b){return a===b.D?b:new Yd(a,ra(b.f))}function ke(a){return new Yd({},ra(a.f))}function le(a){var b=[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null];Mc(a,0,b,0,a.length);return b}var ue=function te(b,c,d,e){d=se(b.root.D,d);var f=b.l-1>>>c&31;if(5===c)b=e;else{var g=d.f[f];b=null!=g?te(b,c-5,g,e):ae(b.root.D,c-5,e)}d.f[f]=b;return d};
function je(a,b,c,d){this.l=a;this.shift=b;this.root=c;this.A=d;this.j=275;this.t=88}h=je.prototype;h.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.B(null,c);case 3:return this.C(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.d=function(a,c){return this.B(null,c)};a.e=function(a,c,d){return this.C(null,c,d)};return a}();h.apply=function(a,b){return this.call.apply(this,[this].concat(ra(b)))};h.c=function(a){return this.B(null,a)};
h.d=function(a,b){return this.C(null,a,b)};h.B=function(a,b){return Pa.e(this,b,null)};h.C=function(a,b,c){return"number"===typeof b?A.e(this,b,c):c};h.L=function(a,b){if(this.root.D)return ge(this,b)[b&31];throw Error("nth after persistent!");};h.$=function(a,b,c){return 0<=b&&b<this.l?A.d(this,b):c};h.Q=function(){if(this.root.D)return this.l;throw Error("count after persistent!");};
h.Pb=function(a,b,c){var d=this;if(d.root.D){if(0<=b&&b<d.l)return $d(this)<=b?d.A[b&31]=c:(a=function(){return function f(a,k){var l=se(d.root.D,k);if(0===a)l.f[b&31]=c;else{var m=b>>>a&31,n=f(a-5,l.f[m]);l.f[m]=n}return l}}(this).call(null,d.shift,d.root),d.root=a),this;if(b===d.l)return Ab(this,c);throw Error("Index "+y.c(b)+" out of bounds for TransientVector of length"+y.c(d.l));}throw Error("assoc! after persistent!");};
h.hb=function(a,b,c){if("number"===typeof b)return Db(this,b,c);throw Error("TransientVector's key for assoc! must be a number.");};
h.Qa=function(a,b){if(this.root.D){if(32>this.l-$d(this))this.A[this.l&31]=b;else{var c=new Yd(this.root.D,this.A),d=[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null];d[0]=b;this.A=d;if(this.l>>>5>1<<this.shift){var d=[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],e=this.shift+
5;d[0]=this.root;d[1]=ae(this.root.D,this.shift,c);this.root=new Yd(this.root.D,d);this.shift=e}else this.root=ue(this,this.shift,this.root,c)}this.l+=1;return this}throw Error("conj! after persistent!");};h.Ra=function(){if(this.root.D){this.root.D=null;var a=this.l-$d(this),b=Array(a);Mc(this.A,0,b,0,a);return new X(null,this.l,this.shift,this.root,b,null)}throw Error("persistent! called twice");};function ve(){this.t=0;this.j=2097152}ve.prototype.F=function(){return!1};var we=new ve;
function xe(a,b){return Pc(Ic(b)?O(a)===O(b)?yd(Ad,Kd.d(function(a){return C.d(R.e(b,F(a),we),sc(a))},a)):null:null)}
function ye(a,b){var c=a.f;if(b instanceof V)a:{for(var d=c.length,e=b.ra,f=0;;){if(d<=f){c=-1;break a}var g=c[f];if(g instanceof V&&e===g.ra){c=f;break a}f+=2}c=void 0}else if("string"==typeof b||"number"===typeof b)a:{d=c.length;for(e=0;;){if(d<=e){c=-1;break a}if(b===c[e]){c=e;break a}e+=2}c=void 0}else if(b instanceof D)a:{d=c.length;e=b.Na;for(f=0;;){if(d<=f){c=-1;break a}g=c[f];if(g instanceof D&&e===g.Na){c=f;break a}f+=2}c=void 0}else if(null==b)a:{d=c.length;for(e=0;;){if(d<=e){c=-1;break a}if(null==
c[e]){c=e;break a}e+=2}c=void 0}else a:{d=c.length;for(e=0;;){if(d<=e){c=-1;break a}if(C.d(b,c[e])){c=e;break a}e+=2}c=void 0}return c}function ze(a,b,c){this.f=a;this.i=b;this.ka=c;this.t=0;this.j=32374990}h=ze.prototype;h.toString=function(){return Nb(this)};h.G=function(){return this.ka};h.aa=function(){return this.i<this.f.length-2?new ze(this.f,this.i+2,this.ka):null};h.Q=function(){return(this.f.length-this.i)/2};h.K=function(){return dc(this)};h.F=function(a,b){return oc(this,b)};
h.R=function(){return qc(I,this.ka)};h.V=function(a,b){return rc.d(b,this)};h.W=function(a,b,c){return rc.e(b,c,this)};h.X=function(){return new X(null,2,5,Y,[this.f[this.i],this.f[this.i+1]],null)};h.ba=function(){return this.i<this.f.length-2?new ze(this.f,this.i+2,this.ka):I};h.N=function(){return this};h.I=function(a,b){return new ze(this.f,this.i,b)};h.P=function(a,b){return N(b,this)};function s(a,b,c,d){this.meta=a;this.l=b;this.f=c;this.o=d;this.j=16647951;this.t=8196}h=s.prototype;
h.toString=function(){return Nb(this)};h.B=function(a,b){return Pa.e(this,b,null)};h.C=function(a,b,c){a=ye(this,b);return-1===a?c:this.f[a+1]};h.G=function(){return this.meta};h.ca=function(){return new s(this.meta,this.l,this.f,this.o)};h.Q=function(){return this.l};h.K=function(){var a=this.o;return null!=a?a:this.o=a=ec(this)};h.F=function(a,b){return xe(this,b)};h.fb=function(){return new Ae({},this.f.length,ra(this.f))};h.R=function(){return hb(Be,this.meta)};
h.V=function(a,b){return rc.d(b,this)};h.W=function(a,b,c){return rc.e(b,c,this)};h.pb=function(a,b){if(0<=ye(this,b)){var c=this.f.length,d=c-2;if(0===d)return Ea(this);for(var d=Array(d),e=0,f=0;;){if(e>=c)return new s(this.meta,this.l-1,d,null);C.d(b,this.f[e])||(d[f]=this.f[e],d[f+1]=this.f[e+1],f+=2);e+=2}}else return this};
h.Oa=function(a,b,c){a=ye(this,b);if(-1===a){if(this.l<Ce){a=this.f;for(var d=a.length,e=Array(d+2),f=0;;)if(f<d)e[f]=a[f],f+=1;else break;e[d]=b;e[d+1]=c;return new s(this.meta,this.l+1,e,null)}return hb(Sa(Sd.d(De,this),b,c),this.meta)}if(c===this.f[a+1])return this;b=ra(this.f);b[a+1]=c;return new s(this.meta,this.l,b,null)};h.eb=function(a,b){return-1!==ye(this,b)};h.N=function(){var a=this.f;return 0<=a.length-2?new ze(a,0,null):null};h.I=function(a,b){return new s(b,this.l,this.f,this.o)};
h.P=function(a,b){if(Jc(b))return Sa(this,A.d(b,0),A.d(b,1));for(var c=this,d=E(b);;){if(null==d)return c;var e=F(d);if(Jc(e))c=Sa(c,A.d(e,0),A.d(e,1)),d=K(d);else throw Error("conj on a map takes map entries or seqables of map entries");}};
h.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.B(null,c);case 3:return this.C(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.d=function(a,c){return this.B(null,c)};a.e=function(a,c,d){return this.C(null,c,d)};return a}();h.apply=function(a,b){return this.call.apply(this,[this].concat(ra(b)))};h.c=function(a){return this.B(null,a)};h.d=function(a,b){return this.C(null,a,b)};var Be=new s(null,0,[],null),Ce=8;
function Ee(a){for(var b=a.length,c=0,d=zb(Be);;)if(c<b)var e=c+2,d=Cb(d,a[c],a[c+1]),c=e;else return Bb(d)}function Ae(a,b,c){this.Za=a;this.Sa=b;this.f=c;this.t=56;this.j=258}h=Ae.prototype;h.hb=function(a,b,c){if(u(this.Za)){a=ye(this,b);if(-1===a)return this.Sa+2<=2*Ce?(this.Sa+=2,this.f.push(b),this.f.push(c),this):vd.e(Fe.d?Fe.d(this.Sa,this.f):Fe.call(null,this.Sa,this.f),b,c);c!==this.f[a+1]&&(this.f[a+1]=c);return this}throw Error("assoc! after persistent!");};
h.Qa=function(a,b){if(u(this.Za)){if(b?b.j&2048||b.wc||(b.j?0:w(Wa,b)):w(Wa,b))return Cb(this,Ge.c?Ge.c(b):Ge.call(null,b),He.c?He.c(b):He.call(null,b));for(var c=E(b),d=this;;){var e=F(c);if(u(e))c=K(c),d=Cb(d,Ge.c?Ge.c(e):Ge.call(null,e),He.c?He.c(e):He.call(null,e));else return d}}else throw Error("conj! after persistent!");};h.Ra=function(){if(u(this.Za))return this.Za=!1,new s(null,Vc(this.Sa),this.f,null);throw Error("persistent! called twice");};h.B=function(a,b){return Pa.e(this,b,null)};
h.C=function(a,b,c){if(u(this.Za))return a=ye(this,b),-1===a?c:this.f[a+1];throw Error("lookup after persistent!");};h.Q=function(){if(u(this.Za))return Vc(this.Sa);throw Error("count after persistent!");};function Fe(a,b){for(var c=zb(De),d=0;;)if(d<a)c=vd.e(c,b[d],b[d+1]),d+=2;else return c}function Ie(){this.S=!1}function Je(a,b){return a===b?!0:cd(a,b)?!0:C.d(a,b)}
var Ke=function(){function a(a,b,c,g,k){a=ra(a);a[b]=c;a[g]=k;return a}function b(a,b,c){a=ra(a);a[b]=c;return a}var c=null,c=function(c,e,f,g,k){switch(arguments.length){case 3:return b.call(this,c,e,f);case 5:return a.call(this,c,e,f,g,k)}throw Error("Invalid arity: "+arguments.length);};c.e=b;c.v=a;return c}();function Le(a,b){var c=Array(a.length-2);Mc(a,0,c,0,2*b);Mc(a,2*(b+1),c,2*b,c.length-2*b);return c}
var Me=function(){function a(a,b,c,g,k,l){a=a.$a(b);a.f[c]=g;a.f[k]=l;return a}function b(a,b,c,g){a=a.$a(b);a.f[c]=g;return a}var c=null,c=function(c,e,f,g,k,l){switch(arguments.length){case 4:return b.call(this,c,e,f,g);case 6:return a.call(this,c,e,f,g,k,l)}throw Error("Invalid arity: "+arguments.length);};c.m=b;c.Y=a;return c}();function Ne(a,b,c){this.D=a;this.J=b;this.f=c}h=Ne.prototype;
h.$a=function(a){if(a===this.D)return this;var b=Wc(this.J),c=Array(0>b?4:2*(b+1));Mc(this.f,0,c,0,2*b);return new Ne(a,this.J,c)};h.kb=function(){return Oe.c?Oe.c(this.f):Oe.call(null,this.f)};h.Ka=function(a,b,c,d){var e=1<<(b>>>a&31);if(0===(this.J&e))return d;var f=Wc(this.J&e-1),e=this.f[2*f],f=this.f[2*f+1];return null==e?f.Ka(a+5,b,c,d):Je(c,e)?f:d};
h.ma=function(a,b,c,d,e,f){var g=1<<(c>>>b&31),k=Wc(this.J&g-1);if(0===(this.J&g)){var l=Wc(this.J);if(2*l<this.f.length){a=this.$a(a);b=a.f;f.S=!0;a:for(c=2*(l-k),f=2*k+(c-1),l=2*(k+1)+(c-1);;){if(0===c)break a;b[l]=b[f];l-=1;c-=1;f-=1}b[2*k]=d;b[2*k+1]=e;a.J|=g;return a}if(16<=l){k=[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null];k[c>>>b&31]=Pe.ma(a,b+5,c,d,e,f);for(e=d=0;;)if(32>d)0!==
(this.J>>>d&1)&&(k[d]=null!=this.f[e]?Pe.ma(a,b+5,Xb(this.f[e]),this.f[e],this.f[e+1],f):this.f[e+1],e+=2),d+=1;else break;return new Qe(a,l+1,k)}b=Array(2*(l+4));Mc(this.f,0,b,0,2*k);b[2*k]=d;b[2*k+1]=e;Mc(this.f,2*k,b,2*(k+1),2*(l-k));f.S=!0;a=this.$a(a);a.f=b;a.J|=g;return a}l=this.f[2*k];g=this.f[2*k+1];if(null==l)return l=g.ma(a,b+5,c,d,e,f),l===g?this:Me.m(this,a,2*k+1,l);if(Je(d,l))return e===g?this:Me.m(this,a,2*k+1,e);f.S=!0;return Me.Y(this,a,2*k,null,2*k+1,Re.ha?Re.ha(a,b+5,l,g,c,d,e):
Re.call(null,a,b+5,l,g,c,d,e))};
h.la=function(a,b,c,d,e){var f=1<<(b>>>a&31),g=Wc(this.J&f-1);if(0===(this.J&f)){var k=Wc(this.J);if(16<=k){g=[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null];g[b>>>a&31]=Pe.la(a+5,b,c,d,e);for(d=c=0;;)if(32>c)0!==(this.J>>>c&1)&&(g[c]=null!=this.f[d]?Pe.la(a+5,Xb(this.f[d]),this.f[d],this.f[d+1],e):this.f[d+1],d+=2),c+=1;else break;return new Qe(null,k+1,g)}a=Array(2*(k+1));Mc(this.f,
0,a,0,2*g);a[2*g]=c;a[2*g+1]=d;Mc(this.f,2*g,a,2*(g+1),2*(k-g));e.S=!0;return new Ne(null,this.J|f,a)}k=this.f[2*g];f=this.f[2*g+1];if(null==k)return k=f.la(a+5,b,c,d,e),k===f?this:new Ne(null,this.J,Ke.e(this.f,2*g+1,k));if(Je(c,k))return d===f?this:new Ne(null,this.J,Ke.e(this.f,2*g+1,d));e.S=!0;return new Ne(null,this.J,Ke.v(this.f,2*g,null,2*g+1,Re.Y?Re.Y(a+5,k,f,b,c,d):Re.call(null,a+5,k,f,b,c,d)))};
h.lb=function(a,b,c){var d=1<<(b>>>a&31);if(0===(this.J&d))return this;var e=Wc(this.J&d-1),f=this.f[2*e],g=this.f[2*e+1];return null==f?(a=g.lb(a+5,b,c),a===g?this:null!=a?new Ne(null,this.J,Ke.e(this.f,2*e+1,a)):this.J===d?null:new Ne(null,this.J^d,Le(this.f,e))):Je(c,f)?new Ne(null,this.J^d,Le(this.f,e)):this};var Pe=new Ne(null,0,[]);function Qe(a,b,c){this.D=a;this.l=b;this.f=c}h=Qe.prototype;h.$a=function(a){return a===this.D?this:new Qe(a,this.l,ra(this.f))};
h.kb=function(){return Se.c?Se.c(this.f):Se.call(null,this.f)};h.Ka=function(a,b,c,d){var e=this.f[b>>>a&31];return null!=e?e.Ka(a+5,b,c,d):d};h.ma=function(a,b,c,d,e,f){var g=c>>>b&31,k=this.f[g];if(null==k)return a=Me.m(this,a,g,Pe.ma(a,b+5,c,d,e,f)),a.l+=1,a;b=k.ma(a,b+5,c,d,e,f);return b===k?this:Me.m(this,a,g,b)};
h.la=function(a,b,c,d,e){var f=b>>>a&31,g=this.f[f];if(null==g)return new Qe(null,this.l+1,Ke.e(this.f,f,Pe.la(a+5,b,c,d,e)));a=g.la(a+5,b,c,d,e);return a===g?this:new Qe(null,this.l,Ke.e(this.f,f,a))};
h.lb=function(a,b,c){var d=b>>>a&31,e=this.f[d];if(null!=e){a=e.lb(a+5,b,c);if(a===e)d=this;else if(null==a)if(8>=this.l)a:{e=this.f;a=2*(this.l-1);b=Array(a);c=0;for(var f=1,g=0;;)if(c<a)c!==d&&null!=e[c]&&(b[f]=e[c],f+=2,g|=1<<c),c+=1;else{d=new Ne(null,g,b);break a}d=void 0}else d=new Qe(null,this.l-1,Ke.e(this.f,d,a));else d=new Qe(null,this.l,Ke.e(this.f,d,a));return d}return this};function Te(a,b,c){b*=2;for(var d=0;;)if(d<b){if(Je(c,a[d]))return d;d+=2}else return-1}
function Ue(a,b,c,d){this.D=a;this.Ga=b;this.l=c;this.f=d}h=Ue.prototype;h.$a=function(a){if(a===this.D)return this;var b=Array(2*(this.l+1));Mc(this.f,0,b,0,2*this.l);return new Ue(a,this.Ga,this.l,b)};h.kb=function(){return Oe.c?Oe.c(this.f):Oe.call(null,this.f)};h.Ka=function(a,b,c,d){a=Te(this.f,this.l,c);return 0>a?d:Je(c,this.f[a])?this.f[a+1]:d};
h.ma=function(a,b,c,d,e,f){if(c===this.Ga){b=Te(this.f,this.l,d);if(-1===b){if(this.f.length>2*this.l)return a=Me.Y(this,a,2*this.l,d,2*this.l+1,e),f.S=!0,a.l+=1,a;c=this.f.length;b=Array(c+2);Mc(this.f,0,b,0,c);b[c]=d;b[c+1]=e;f.S=!0;f=this.l+1;a===this.D?(this.f=b,this.l=f,a=this):a=new Ue(this.D,this.Ga,f,b);return a}return this.f[b+1]===e?this:Me.m(this,a,b+1,e)}return(new Ne(a,1<<(this.Ga>>>b&31),[null,this,null,null])).ma(a,b,c,d,e,f)};
h.la=function(a,b,c,d,e){return b===this.Ga?(a=Te(this.f,this.l,c),-1===a?(a=2*this.l,b=Array(a+2),Mc(this.f,0,b,0,a),b[a]=c,b[a+1]=d,e.S=!0,new Ue(null,this.Ga,this.l+1,b)):C.d(this.f[a],d)?this:new Ue(null,this.Ga,this.l,Ke.e(this.f,a+1,d))):(new Ne(null,1<<(this.Ga>>>a&31),[null,this])).la(a,b,c,d,e)};h.lb=function(a,b,c){a=Te(this.f,this.l,c);return-1===a?this:1===this.l?null:new Ue(null,this.Ga,this.l-1,Le(this.f,Vc(a)))};
var Re=function(){function a(a,b,c,g,k,l,m){var n=Xb(c);if(n===k)return new Ue(null,n,2,[c,g,l,m]);var p=new Ie;return Pe.ma(a,b,n,c,g,p).ma(a,b,k,l,m,p)}function b(a,b,c,g,k,l){var m=Xb(b);if(m===g)return new Ue(null,m,2,[b,c,k,l]);var n=new Ie;return Pe.la(a,m,b,c,n).la(a,g,k,l,n)}var c=null,c=function(c,e,f,g,k,l,m){switch(arguments.length){case 6:return b.call(this,c,e,f,g,k,l);case 7:return a.call(this,c,e,f,g,k,l,m)}throw Error("Invalid arity: "+arguments.length);};c.Y=b;c.ha=a;return c}();
function Ve(a,b,c,d,e){this.meta=a;this.na=b;this.i=c;this.s=d;this.o=e;this.t=0;this.j=32374860}h=Ve.prototype;h.toString=function(){return Nb(this)};h.G=function(){return this.meta};h.K=function(){var a=this.o;return null!=a?a:this.o=a=dc(this)};h.F=function(a,b){return oc(this,b)};h.R=function(){return qc(I,this.meta)};h.V=function(a,b){return rc.d(b,this)};h.W=function(a,b,c){return rc.e(b,c,this)};h.X=function(){return null==this.s?new X(null,2,5,Y,[this.na[this.i],this.na[this.i+1]],null):F(this.s)};
h.ba=function(){return null==this.s?Oe.e?Oe.e(this.na,this.i+2,null):Oe.call(null,this.na,this.i+2,null):Oe.e?Oe.e(this.na,this.i,K(this.s)):Oe.call(null,this.na,this.i,K(this.s))};h.N=function(){return this};h.I=function(a,b){return new Ve(b,this.na,this.i,this.s,this.o)};h.P=function(a,b){return N(b,this)};
var Oe=function(){function a(a,b,c){if(null==c)for(c=a.length;;)if(b<c){if(null!=a[b])return new Ve(null,a,b,null,null);var g=a[b+1];if(u(g)&&(g=g.kb(),u(g)))return new Ve(null,a,b+2,g,null);b+=2}else return null;else return new Ve(null,a,b,c,null)}function b(a){return c.e(a,0,null)}var c=null,c=function(c,e,f){switch(arguments.length){case 1:return b.call(this,c);case 3:return a.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.c=b;c.e=a;return c}();
function We(a,b,c,d,e){this.meta=a;this.na=b;this.i=c;this.s=d;this.o=e;this.t=0;this.j=32374860}h=We.prototype;h.toString=function(){return Nb(this)};h.G=function(){return this.meta};h.K=function(){var a=this.o;return null!=a?a:this.o=a=dc(this)};h.F=function(a,b){return oc(this,b)};h.R=function(){return qc(I,this.meta)};h.V=function(a,b){return rc.d(b,this)};h.W=function(a,b,c){return rc.e(b,c,this)};h.X=function(){return F(this.s)};
h.ba=function(){return Se.m?Se.m(null,this.na,this.i,K(this.s)):Se.call(null,null,this.na,this.i,K(this.s))};h.N=function(){return this};h.I=function(a,b){return new We(b,this.na,this.i,this.s,this.o)};h.P=function(a,b){return N(b,this)};
var Se=function(){function a(a,b,c,g){if(null==g)for(g=b.length;;)if(c<g){var k=b[c];if(u(k)&&(k=k.kb(),u(k)))return new We(a,b,c+1,k,null);c+=1}else return null;else return new We(a,b,c,g,null)}function b(a){return c.m(null,a,0,null)}var c=null,c=function(c,e,f,g){switch(arguments.length){case 1:return b.call(this,c);case 4:return a.call(this,c,e,f,g)}throw Error("Invalid arity: "+arguments.length);};c.c=b;c.m=a;return c}();
function Xe(a,b,c,d,e,f){this.meta=a;this.l=b;this.root=c;this.Z=d;this.ea=e;this.o=f;this.j=16123663;this.t=8196}h=Xe.prototype;h.toString=function(){return Nb(this)};h.B=function(a,b){return Pa.e(this,b,null)};h.C=function(a,b,c){return null==b?this.Z?this.ea:c:null==this.root?c:this.root.Ka(0,Xb(b),b,c)};h.G=function(){return this.meta};h.ca=function(){return new Xe(this.meta,this.l,this.root,this.Z,this.ea,this.o)};h.Q=function(){return this.l};
h.K=function(){var a=this.o;return null!=a?a:this.o=a=ec(this)};h.F=function(a,b){return xe(this,b)};h.fb=function(){return new Ye({},this.root,this.l,this.Z,this.ea)};h.R=function(){return hb(De,this.meta)};h.pb=function(a,b){if(null==b)return this.Z?new Xe(this.meta,this.l-1,this.root,!1,null,null):this;if(null==this.root)return this;var c=this.root.lb(0,Xb(b),b);return c===this.root?this:new Xe(this.meta,this.l-1,c,this.Z,this.ea,null)};
h.Oa=function(a,b,c){if(null==b)return this.Z&&c===this.ea?this:new Xe(this.meta,this.Z?this.l:this.l+1,this.root,!0,c,null);a=new Ie;b=(null==this.root?Pe:this.root).la(0,Xb(b),b,c,a);return b===this.root?this:new Xe(this.meta,a.S?this.l+1:this.l,b,this.Z,this.ea,null)};h.eb=function(a,b){return null==b?this.Z:null==this.root?!1:this.root.Ka(0,Xb(b),b,Nc)!==Nc};h.N=function(){if(0<this.l){var a=null!=this.root?this.root.kb():null;return this.Z?N(new X(null,2,5,Y,[null,this.ea],null),a):a}return null};
h.I=function(a,b){return new Xe(b,this.l,this.root,this.Z,this.ea,this.o)};h.P=function(a,b){if(Jc(b))return Sa(this,A.d(b,0),A.d(b,1));for(var c=this,d=E(b);;){if(null==d)return c;var e=F(d);if(Jc(e))c=Sa(c,A.d(e,0),A.d(e,1)),d=K(d);else throw Error("conj on a map takes map entries or seqables of map entries");}};
h.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.B(null,c);case 3:return this.C(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.d=function(a,c){return this.B(null,c)};a.e=function(a,c,d){return this.C(null,c,d)};return a}();h.apply=function(a,b){return this.call.apply(this,[this].concat(ra(b)))};h.c=function(a){return this.B(null,a)};h.d=function(a,b){return this.C(null,a,b)};var De=new Xe(null,0,null,!1,null,0);
function xc(a,b){for(var c=a.length,d=0,e=zb(De);;)if(d<c)var f=d+1,e=e.hb(null,a[d],b[d]),d=f;else return Bb(e)}function Ye(a,b,c,d,e){this.D=a;this.root=b;this.count=c;this.Z=d;this.ea=e;this.t=56;this.j=258}h=Ye.prototype;h.hb=function(a,b,c){return Ze(this,b,c)};
h.Qa=function(a,b){var c;a:{if(this.D){if(b?b.j&2048||b.wc||(b.j?0:w(Wa,b)):w(Wa,b)){c=Ze(this,Ge.c?Ge.c(b):Ge.call(null,b),He.c?He.c(b):He.call(null,b));break a}c=E(b);for(var d=this;;){var e=F(c);if(u(e))c=K(c),d=Ze(d,Ge.c?Ge.c(e):Ge.call(null,e),He.c?He.c(e):He.call(null,e));else{c=d;break a}}}else throw Error("conj! after persistent");c=void 0}return c};
h.Ra=function(){var a;if(this.D)this.D=null,a=new Xe(null,this.count,this.root,this.Z,this.ea,null);else throw Error("persistent! called twice");return a};h.B=function(a,b){return null==b?this.Z?this.ea:null:null==this.root?null:this.root.Ka(0,Xb(b),b)};h.C=function(a,b,c){return null==b?this.Z?this.ea:c:null==this.root?c:this.root.Ka(0,Xb(b),b,c)};h.Q=function(){if(this.D)return this.count;throw Error("count after persistent!");};
function Ze(a,b,c){if(a.D){if(null==b)a.ea!==c&&(a.ea=c),a.Z||(a.count+=1,a.Z=!0);else{var d=new Ie;b=(null==a.root?Pe:a.root).ma(a.D,0,Xb(b),b,c,d);b!==a.root&&(a.root=b);d.S&&(a.count+=1)}return a}throw Error("assoc! after persistent!");}
var Fd=function(){function a(a){var d=null;0<arguments.length&&(d=L(Array.prototype.slice.call(arguments,0),0));return b.call(this,d)}function b(a){a=E(a);for(var b=zb(De);;)if(a){var e=K(K(a)),b=vd.e(b,F(a),sc(a));a=e}else return Bb(b)}a.r=0;a.k=function(a){a=E(a);return b(a)};a.g=b;return a}(),$e=function(){function a(a){var d=null;0<arguments.length&&(d=L(Array.prototype.slice.call(arguments,0),0));return b.call(this,d)}function b(a){return new s(null,Vc(O(a)),T.d(ta,a),null)}a.r=0;a.k=function(a){a=
E(a);return b(a)};a.g=b;return a}();function af(a,b){this.La=a;this.ka=b;this.t=0;this.j=32374988}h=af.prototype;h.toString=function(){return Nb(this)};h.G=function(){return this.ka};h.aa=function(){var a=this.La,a=(a?a.j&128||a.Nb||(a.j?0:w(Na,a)):w(Na,a))?this.La.aa(null):K(this.La);return null==a?null:new af(a,this.ka)};h.K=function(){return dc(this)};h.F=function(a,b){return oc(this,b)};h.R=function(){return qc(I,this.ka)};h.V=function(a,b){return rc.d(b,this)};
h.W=function(a,b,c){return rc.e(b,c,this)};h.X=function(){return this.La.X(null).Cb()};h.ba=function(){var a=this.La,a=(a?a.j&128||a.Nb||(a.j?0:w(Na,a)):w(Na,a))?this.La.aa(null):K(this.La);return null!=a?new af(a,this.ka):I};h.N=function(){return this};h.I=function(a,b){return new af(this.La,b)};h.P=function(a,b){return N(b,this)};function bf(a){return(a=E(a))?new af(a,null):null}function Ge(a){return Xa(a)}function He(a){return Ya(a)}
var cf=function(){function a(a){var d=null;0<arguments.length&&(d=L(Array.prototype.slice.call(arguments,0),0));return b.call(this,d)}function b(a){return u(zd(Ad,a))?ua.d(function(a,b){return uc.d(u(a)?a:Be,b)},a):null}a.r=0;a.k=function(a){a=E(a);return b(a)};a.g=b;return a}(),df=function(){function a(a,d){var e=null;1<arguments.length&&(e=L(Array.prototype.slice.call(arguments,1),0));return b.call(this,a,e)}function b(a,b){return u(zd(Ad,b))?ua.d(function(a){return function(b,c){return ua.e(a,
u(b)?b:Be,E(c))}}(function(b,d){var g=F(d),k=sc(d);return Qc(b,g)?S.e(b,g,a.d?a.d(R.d(b,g),k):a.call(null,R.d(b,g),k)):S.e(b,g,k)}),b):null}a.r=1;a.k=function(a){var d=F(a);a=G(a);return b(d,a)};a.g=b;return a}();function ef(a,b,c){this.meta=a;this.Ja=b;this.o=c;this.j=15077647;this.t=8196}h=ef.prototype;h.toString=function(){return Nb(this)};h.B=function(a,b){return Pa.e(this,b,null)};h.C=function(a,b,c){return Qa(this.Ja,b)?b:c};h.G=function(){return this.meta};
h.ca=function(){return new ef(this.meta,this.Ja,this.o)};h.Q=function(){return Da(this.Ja)};h.K=function(){var a=this.o;return null!=a?a:this.o=a=ec(this)};h.F=function(a,b){return Gc(b)&&O(this)===O(b)&&yd(function(a){return function(b){return Qc(a,b)}}(this),b)};h.fb=function(){return new ff(zb(this.Ja))};h.R=function(){return qc(hf,this.meta)};h.Ob=function(a,b){return new ef(this.meta,Va(this.Ja,b),null)};h.N=function(){return bf(this.Ja)};h.I=function(a,b){return new ef(b,this.Ja,this.o)};
h.P=function(a,b){return new ef(this.meta,S.e(this.Ja,b,null),null)};h.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.B(null,c);case 3:return this.C(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.d=function(a,c){return this.B(null,c)};a.e=function(a,c,d){return this.C(null,c,d)};return a}();h.apply=function(a,b){return this.call.apply(this,[this].concat(ra(b)))};h.c=function(a){return this.B(null,a)};h.d=function(a,b){return this.C(null,a,b)};
var hf=new ef(null,Be,0);function ff(a){this.Ha=a;this.j=259;this.t=136}h=ff.prototype;h.call=function(){function a(a,b,c){return Pa.e(this.Ha,b,Nc)===Nc?c:b}function b(a,b){return Pa.e(this.Ha,b,Nc)===Nc?null:b}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return b.call(this,c,e);case 3:return a.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.d=b;c.e=a;return c}();h.apply=function(a,b){return this.call.apply(this,[this].concat(ra(b)))};
h.c=function(a){return Pa.e(this.Ha,a,Nc)===Nc?null:a};h.d=function(a,b){return Pa.e(this.Ha,a,Nc)===Nc?b:a};h.B=function(a,b){return Pa.e(this,b,null)};h.C=function(a,b,c){return Pa.e(this.Ha,b,Nc)===Nc?c:b};h.Q=function(){return O(this.Ha)};h.Qa=function(a,b){this.Ha=vd.e(this.Ha,b,null);return this};h.Ra=function(){return new ef(null,Bb(this.Ha),null)};
function jf(a){a=E(a);if(null==a)return hf;if(a instanceof bc&&0===a.i){a=a.f;a:{for(var b=0,c=zb(hf);;)if(b<a.length)var d=b+1,c=c.Qa(null,a[b]),b=d;else{a=c;break a}a=void 0}return a.Ra(null)}for(d=zb(hf);;)if(null!=a)b=a.aa(null),d=d.Qa(null,a.X(null)),a=b;else return d.Ra(null)}function dd(a){if(a&&(a.t&4096||a.yc))return a.name;if("string"===typeof a)return a;throw Error("Doesn't support name: "+y.c(a));}
var kf=function(){function a(a,b){return new fd(null,function(){var f=E(b);return f?u(a.c?a.c(F(f)):a.call(null,F(f)))?N(F(f),c.d(a,G(f))):null:null},null,null)}function b(a){return function(b){return function(){function c(f,g){return u(a.c?a.c(g):a.call(null,g))?b.d?b.d(f,g):b.call(null,f,g):new gc(f)}function g(a){return b.c?b.c(a):b.call(null,a)}function k(){return b.n?b.n():b.call(null)}var l=null,l=function(a,b){switch(arguments.length){case 0:return k.call(this);case 1:return g.call(this,a);
case 2:return c.call(this,a,b)}throw Error("Invalid arity: "+arguments.length);};l.n=k;l.c=g;l.d=c;return l}()}}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,c);case 2:return a.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.c=b;c.d=a;return c}();function lf(a,b,c,d,e){this.meta=a;this.start=b;this.end=c;this.step=d;this.o=e;this.j=32375006;this.t=8192}h=lf.prototype;h.toString=function(){return Nb(this)};
h.L=function(a,b){if(b<Da(this))return this.start+b*this.step;if(this.start>this.end&&0===this.step)return this.start;throw Error("Index out of bounds");};h.$=function(a,b,c){return b<Da(this)?this.start+b*this.step:this.start>this.end&&0===this.step?this.start:c};h.G=function(){return this.meta};h.ca=function(){return new lf(this.meta,this.start,this.end,this.step,this.o)};
h.aa=function(){return 0<this.step?this.start+this.step<this.end?new lf(this.meta,this.start+this.step,this.end,this.step,null):null:this.start+this.step>this.end?new lf(this.meta,this.start+this.step,this.end,this.step,null):null};h.Q=function(){return na(pb(this))?0:Math.ceil.c?Math.ceil.c((this.end-this.start)/this.step):Math.ceil.call(null,(this.end-this.start)/this.step)};h.K=function(){var a=this.o;return null!=a?a:this.o=a=dc(this)};h.F=function(a,b){return oc(this,b)};
h.R=function(){return qc(I,this.meta)};h.V=function(a,b){return jc.d(this,b)};h.W=function(a,b,c){return jc.e(this,b,c)};h.X=function(){return null==pb(this)?null:this.start};h.ba=function(){return null!=pb(this)?new lf(this.meta,this.start+this.step,this.end,this.step,null):I};h.N=function(){return 0<this.step?this.start<this.end?this:null:this.start>this.end?this:null};h.I=function(a,b){return new lf(b,this.start,this.end,this.step,this.o)};h.P=function(a,b){return N(b,this)};
var mf=function(){function a(a,b,c){return new lf(null,a,b,c,null)}function b(a,b){return e.e(a,b,1)}function c(a){return e.e(0,a,1)}function d(){return e.e(0,Number.MAX_VALUE,1)}var e=null,e=function(e,g,k){switch(arguments.length){case 0:return d.call(this);case 1:return c.call(this,e);case 2:return b.call(this,e,g);case 3:return a.call(this,e,g,k)}throw Error("Invalid arity: "+arguments.length);};e.n=d;e.c=c;e.d=b;e.e=a;return e}(),nf=function(){function a(a,b){for(;;)if(E(b)&&0<a){var c=a-1,g=
K(b);a=c;b=g}else return null}function b(a){for(;;)if(E(a))a=K(a);else return null}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,c);case 2:return a.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.c=b;c.d=a;return c}(),of=function(){function a(a,b){nf.d(a,b);return b}function b(a){nf.c(a);return a}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,c);case 2:return a.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);
};c.c=b;c.d=a;return c}();function pf(a,b,c,d,e,f,g){var k=ga;try{ga=null==ga?null:ga-1;if(null!=ga&&0>ga)return B(a,"#");B(a,c);E(g)&&(b.e?b.e(F(g),a,f):b.call(null,F(g),a,f));for(var l=K(g),m=ma.c(f)-1;;)if(!l||null!=m&&0===m){E(l)&&0===m&&(B(a,d),B(a,"..."));break}else{B(a,d);b.e?b.e(F(l),a,f):b.call(null,F(l),a,f);var n=K(l);c=m-1;l=n;m=c}return B(a,e)}finally{ga=k}}
var qf=function(){function a(a,d){var e=null;1<arguments.length&&(e=L(Array.prototype.slice.call(arguments,1),0));return b.call(this,a,e)}function b(a,b){for(var e=E(b),f=null,g=0,k=0;;)if(k<g){var l=f.L(null,k);B(a,l);k+=1}else if(e=E(e))f=e,Kc(f)?(e=Gb(f),g=Hb(f),f=e,l=O(e),e=g,g=l):(l=F(f),B(a,l),e=K(f),f=null,g=0),k=0;else return null}a.r=1;a.k=function(a){var d=F(a);a=G(a);return b(d,a)};a.g=b;return a}(),rf={'"':'\\"',"\\":"\\\\","\b":"\\b","\f":"\\f","\n":"\\n","\r":"\\r","\t":"\\t"};
function sf(a){return'"'+y.c(a.replace(RegExp('[\\\\"\b\f\n\r\t]',"g"),function(a){return rf[a]}))+'"'}
var vf=function tf(b,c,d){if(null==b)return B(c,"nil");if(void 0===b)return B(c,"#\x3cundefined\x3e");u(function(){var c=R.d(d,ka);return u(c)?(c=b?b.j&131072||b.xc?!0:b.j?!1:w(eb,b):w(eb,b))?Cc(b):c:c}())&&(B(c,"^"),tf(Cc(b),c,d),B(c," "));if(null==b)return B(c,"nil");if(b.Ya)return b.ib(b,c,d);if(b&&(b.j&2147483648||b.T))return b.H(null,c,d);if(oa(b)===Boolean||"number"===typeof b)return B(c,""+y.c(b));if(null!=b&&b.constructor===Object)return B(c,"#js "),uf.m?uf.m(Kd.d(function(c){return new X(null,
2,5,Y,[ed.c(c),b[c]],null)},Lc(b)),tf,c,d):uf.call(null,Kd.d(function(c){return new X(null,2,5,Y,[ed.c(c),b[c]],null)},Lc(b)),tf,c,d);if(b instanceof Array)return pf(c,tf,"#js ["," ","]",d,b);if("string"==typeof b)return u(ja.c(d))?B(c,sf(b)):B(c,b);if(Ac(b))return qf.g(c,L(["#\x3c",""+y.c(b),"\x3e"],0));if(b instanceof Date){var e=function(b,c){for(var d=""+y.c(b);;)if(O(d)<c)d="0"+y.c(d);else return d};return qf.g(c,L(['#inst "',""+y.c(b.getUTCFullYear()),"-",e(b.getUTCMonth()+1,2),"-",e(b.getUTCDate(),
2),"T",e(b.getUTCHours(),2),":",e(b.getUTCMinutes(),2),":",e(b.getUTCSeconds(),2),".",e(b.getUTCMilliseconds(),3),"-",'00:00"'],0))}return b instanceof RegExp?qf.g(c,L(['#"',b.source,'"'],0)):(b?b.j&2147483648||b.T||(b.j?0:w(ub,b)):w(ub,b))?vb(b,c,d):qf.g(c,L(["#\x3c",""+y.c(b),"\x3e"],0))};
function wf(a,b){var c=new fa;a:{var d=new Mb(c);vf(F(a),d,b);for(var e=E(K(a)),f=null,g=0,k=0;;)if(k<g){var l=f.L(null,k);B(d," ");vf(l,d,b);k+=1}else if(e=E(e))f=e,Kc(f)?(e=Gb(f),g=Hb(f),f=e,l=O(e),e=g,g=l):(l=F(f),B(d," "),vf(l,d,b),e=K(f),f=null,g=0),k=0;else break a}return c}
var Id=function(){function a(a){var d=null;0<arguments.length&&(d=L(Array.prototype.slice.call(arguments,0),0));return b.call(this,d)}function b(a){var b=ha();return Ec(a)?"":""+y.c(wf(a,b))}a.r=0;a.k=function(a){a=E(a);return b(a)};a.g=b;return a}();function uf(a,b,c,d){return pf(c,function(a,c,d){b.e?b.e(Xa(a),c,d):b.call(null,Xa(a),c,d);B(c," ");return b.e?b.e(Ya(a),c,d):b.call(null,Ya(a),c,d)},"{",", ","}",d,E(a))}bc.prototype.T=!0;bc.prototype.H=function(a,b,c){return pf(b,vf,"("," ",")",c,this)};
fd.prototype.T=!0;fd.prototype.H=function(a,b,c){return pf(b,vf,"("," ",")",c,this)};Ve.prototype.T=!0;Ve.prototype.H=function(a,b,c){return pf(b,vf,"("," ",")",c,this)};ze.prototype.T=!0;ze.prototype.H=function(a,b,c){return pf(b,vf,"("," ",")",c,this)};oe.prototype.T=!0;oe.prototype.H=function(a,b,c){return pf(b,vf,"("," ",")",c,this)};bd.prototype.T=!0;bd.prototype.H=function(a,b,c){return pf(b,vf,"("," ",")",c,this)};nc.prototype.T=!0;
nc.prototype.H=function(a,b,c){return pf(b,vf,"("," ",")",c,this)};Xe.prototype.T=!0;Xe.prototype.H=function(a,b,c){return uf(this,vf,b,c)};We.prototype.T=!0;We.prototype.H=function(a,b,c){return pf(b,vf,"("," ",")",c,this)};qe.prototype.T=!0;qe.prototype.H=function(a,b,c){return pf(b,vf,"["," ","]",c,this)};ef.prototype.T=!0;ef.prototype.H=function(a,b,c){return pf(b,vf,"#{"," ","}",c,this)};md.prototype.T=!0;md.prototype.H=function(a,b,c){return pf(b,vf,"("," ",")",c,this)};Ed.prototype.T=!0;
Ed.prototype.H=function(a,b,c){B(b,"#\x3cAtom: ");vf(this.state,b,c);return B(b,"\x3e")};X.prototype.T=!0;X.prototype.H=function(a,b,c){return pf(b,vf,"["," ","]",c,this)};Zc.prototype.T=!0;Zc.prototype.H=function(a,b){return B(b,"()")};s.prototype.T=!0;s.prototype.H=function(a,b,c){return uf(this,vf,b,c)};lf.prototype.T=!0;lf.prototype.H=function(a,b,c){return pf(b,vf,"("," ",")",c,this)};af.prototype.T=!0;af.prototype.H=function(a,b,c){return pf(b,vf,"("," ",")",c,this)};Yc.prototype.T=!0;
Yc.prototype.H=function(a,b,c){return pf(b,vf,"("," ",")",c,this)};X.prototype.mb=!0;X.prototype.nb=function(a,b){return Rc.d(this,b)};qe.prototype.mb=!0;qe.prototype.nb=function(a,b){return Rc.d(this,b)};V.prototype.mb=!0;V.prototype.nb=function(a,b){return Zb(this,b)};D.prototype.mb=!0;D.prototype.nb=function(a,b){return Zb(this,b)};function xf(a,b,c){xb(a,b,c)}
var yf=null,zf=function(){function a(a){null==yf&&(yf=W.c?W.c(0):W.call(null,0));return ac.c(""+y.c(a)+y.c(Jd.d(yf,fc)))}function b(){return c.c("G__")}var c=null,c=function(c){switch(arguments.length){case 0:return b.call(this);case 1:return a.call(this,c)}throw Error("Invalid arity: "+arguments.length);};c.n=b;c.c=a;return c}(),Af={};function Bf(a){if(a?a.tc:a)return a.tc(a);var b;b=Bf[q(null==a?null:a)];if(!b&&(b=Bf._,!b))throw x("IEncodeJS.-clj-\x3ejs",a);return b.call(null,a)}
function Cf(a){return(a?u(u(null)?null:a.sc)||(a.U?0:w(Af,a)):w(Af,a))?Bf(a):"string"===typeof a||"number"===typeof a||a instanceof V||a instanceof D?Df.c?Df.c(a):Df.call(null,a):Id.g(L([a],0))}
var Df=function Ef(b){if(null==b)return null;if(b?u(u(null)?null:b.sc)||(b.U?0:w(Af,b)):w(Af,b))return Bf(b);if(b instanceof V)return dd(b);if(b instanceof D)return""+y.c(b);if(Ic(b)){var c={};b=E(b);for(var d=null,e=0,f=0;;)if(f<e){var g=d.L(null,f),k=Q.e(g,0,null),g=Q.e(g,1,null);c[Cf(k)]=Ef(g);f+=1}else if(b=E(b))Kc(b)?(e=Gb(b),b=Hb(b),d=e,e=O(e)):(e=F(b),d=Q.e(e,0,null),e=Q.e(e,1,null),c[Cf(d)]=Ef(e),b=K(b),d=null,e=0),f=0;else break;return c}if(Fc(b)){c=[];b=E(Kd.d(Ef,b));d=null;for(f=e=0;;)if(f<
e)k=d.L(null,f),c.push(k),f+=1;else if(b=E(b))d=b,Kc(d)?(b=Gb(d),f=Hb(d),d=b,e=O(b),b=f):(b=F(d),c.push(b),b=K(d),d=null,e=0),f=0;else break;return c}return b},Ff={};function Gf(a,b){if(a?a.rc:a)return a.rc(a,b);var c;c=Gf[q(null==a?null:a)];if(!c&&(c=Gf._,!c))throw x("IEncodeClojure.-js-\x3eclj",a);return c.call(null,a,b)}
var If=function(){function a(a){return b.g(a,L([new s(null,1,[Hf,!1],null)],0))}var b=null,c=function(){function a(c,d){var k=null;1<arguments.length&&(k=L(Array.prototype.slice.call(arguments,1),0));return b.call(this,c,k)}function b(a,c){if(a?u(u(null)?null:a.nd)||(a.U?0:w(Ff,a)):w(Ff,a))return Gf(a,T.d($e,c));if(E(c)){var d=Oc(c)?T.d(Fd,c):c,e=R.d(d,Hf);return function(a,b,c,d){return function v(e){return Oc(e)?of.c(Kd.d(v,e)):Fc(e)?Sd.d(vc(e),Kd.d(v,e)):e instanceof Array?ne(Kd.d(v,e)):oa(e)===
Object?Sd.d(Be,function(){return function(a,b,c,d){return function jb(f){return new fd(null,function(a,b,c,d){return function(){for(;;){var a=E(f);if(a){if(Kc(a)){var b=Gb(a),c=O(b),g=kd(c);a:{for(var k=0;;)if(k<c){var l=A.d(b,k),l=new X(null,2,5,Y,[d.c?d.c(l):d.call(null,l),v(e[l])],null);g.add(l);k+=1}else{b=!0;break a}b=void 0}return b?nd(g.M(),jb(Hb(a))):nd(g.M(),null)}g=F(a);return N(new X(null,2,5,Y,[d.c?d.c(g):d.call(null,g),v(e[g])],null),jb(G(a)))}return null}}}(a,b,c,d),null,null)}}(a,b,
c,d)(Lc(e))}()):e}}(c,d,e,u(e)?ed:y)(a)}return null}a.r=1;a.k=function(a){var c=F(a);a=G(a);return b(c,a)};a.g=b;return a}(),b=function(b,e){switch(arguments.length){case 1:return a.call(this,b);default:return c.g(b,L(arguments,1))}throw Error("Invalid arity: "+arguments.length);};b.r=1;b.k=c.k;b.c=a;b.g=c.g;return b}();var Jf=new V(null,"y","y",-1757859776),Kf=new V(null,"role","role",-736691072),Lf=new V(null,"interact","interact",-1474545248),Mf=new V(null,"old-state","old-state",1039580704),Nf=new V(null,"path","path",-188191168),Of=new V(null,"fen","fen",1034199872),Pf=new V(null,"new-value","new-value",1087038368),Qf=new V(null,"setDests","setDests",-1852794814),Rf=new V(null,"descriptor","descriptor",76122018),Sf=new V(null,"data-coord-y","data-coord-y",2063152515),Tf=new V(null,"componentDidUpdate","componentDidUpdate",
-1983477981),Uf=new V(null,"fn","fn",-1175266204),Vf=new V(null,"new-state","new-state",-490349212),Wf=new V(null,"instrument","instrument",-960698844),ka=new V(null,"meta","meta",1499536964),Xf=new V(null,"react-key","react-key",1337881348),Yf=new V(null,"setLastMove","setLastMove",-416532572),Zf=new V(null,"color","color",1011675173),$f=new V("om.core","id","om.core/id",299074693),la=new V(null,"dup","dup",556298533),ag=new V(null,"toggle-orientation","toggle-orientation",879565349),bg=new V(null,
"key","key",-1516042587),cg=new V(null,"set-color","set-color",-1342268539),dg=new V(null,"bottom","bottom",-1550509018),eg=new V(null,"set-last-move","set-last-move",-1165582362),fg=new V(null,"chess","chess",-371830393),gg=new V(null,"top","top",-1856271961),hg=new V(null,"last-move?","last-move?",408079079),Gd=new V(null,"validator","validator",-1966190681),ig=new V(null,"free","free",801364328),jg=new V(null,"finally-block","finally-block",832982472),kg=new V(null,"getColor","getColor",-599222456),
lg=new V(null,"piece","piece",1396691784),mg=new V(null,"set-check","set-check",1195802440),ng=new V(null,"set-pieces","set-pieces",-1527661431),og=new V(null,"events","events",1792552201),pg=new V(null,"width","width",-384071477),qg=new V(null,"move","move",-2110884309),rg=new V(null,"old-value","old-value",862546795),sg=new V(null,"orientation","orientation",623557579),tg=new V("om.core","pass","om.core/pass",-1453289268),Z=new V(null,"recur","recur",-437573268),ug=new V(null,"init-state","init-state",
1450863212),vg=new V(null,"catch-block","catch-block",1175212748),wg=new V(null,"state","state",-1988618099),ia=new V(null,"flush-on-newline","flush-on-newline",-151457939),xg=new V(null,"dragging","dragging",1185097613),yg=new V(null,"componentWillUnmount","componentWillUnmount",1573788814),zg=new V(null,"componentWillReceiveProps","componentWillReceiveProps",559988974),Ag=new V(null,"get-position","get-position",-1531208561),Bg=new V(null,"get-orientation","get-orientation",1685724751),Cg=new V(null,
"setFen","setFen",-1099206801),Dg=new V(null,"shouldComponentUpdate","shouldComponentUpdate",1795750960),Eg=new V(null,"style","style",-496642736),Fg=new V(null,"setStartPos","setStartPos",-477849104),Gg=new V(null,"api-chan","api-chan",692853264),Hg=new V(null,"api-move","api-move",-1712244016),ja=new V(null,"readably","readably",1129599760),Ig=new V(null,"set-dests","set-dests",1766208177),Jg=new V(null,"render","render",-1408033454),Kg=new V(null,"after","after",594996914),Lg=new V(null,"ctrl-chan",
"ctrl-chan",2048802035),Mg=new V(null,"dest?","dest?",307922387),Ng=new V(null,"setColor","setColor",-1426995533),ma=new V(null,"print-length","print-length",1931866356),Og=new V(null,"componentWillUpdate","componentWillUpdate",657390932),Pg=new V(null,"select-square","select-square",1973035732),Qg=new V(null,"getInitialState","getInitialState",1541760916),Rg=new V(null,"catch-exception","catch-exception",-1997306795),Sg=new V(null,"opts","opts",155075701),Tg=new V(null,"setPieces","setPieces",2113691477),
Ug=new V(null,"prev","prev",-1597069226),Vg=new V(null,"drag-start","drag-start",292353430),Wg=new V(null,"continue-block","continue-block",-1852047850),Xg=new V("om.core","index","om.core/index",-1724175434),Yg=new V(null,"getPosition","getPosition",-555166697),Zg=new V(null,"move-piece","move-piece",1196406071),$g=new V(null,"shared","shared",-384145993),bh=new V(null,"right","right",-452581833),ch=new V(null,"get-color","get-color",-2122105193),dh=new V(null,"data-coord-x","data-coord-x",173119287),
eh=new V(null,"dests","dests",259411416),fh=new V(null,"componentDidMount","componentDidMount",955710936),gh=new V(null,"drop-off","drop-off",1624574584),hh=new V(null,"set-fen","set-fen",131654328),ih=new V(null,"x","x",2099068185),jh=new V(null,"toggleOrientation","toggleOrientation",-660239975),kh=new V(null,"tag","tag",-1290361223),lh=new V(null,"target","target",253001721),mh=new V(null,"getDisplayName","getDisplayName",1324429466),nh=new V(null,"setOrientation","setOrientation",-1558235206),
oh=new V(null,"movable","movable",277477435),ph=new V(null,"getOrientation","getOrientation",1715006427),qh=new V(null,"selected?","selected?",-742502788),Hf=new V(null,"keywordize-keys","keywordize-keys",1310784252),rh=new V(null,"drag-center","drag-center",63585565),sh=new V(null,"componentWillMount","componentWillMount",-285327619),th=new V(null,"set-orientation","set-orientation",1177131166),uh=new V("om.core","defer","om.core/defer",-1038866178),vh=new V(null,"check?","check?",-1230991970),wh=
new V(null,"height","height",1025178622),xh=new V(null,"setCheck","setCheck",792619167),yh=new V(null,"tx-listen","tx-listen",119130367),zh=new V(null,"clear","clear",1877104959),Ah=new V(null,"left","left",-399115937);function Bh(a){return Ch.d(" ",Qd.d(Ad,a))};var Dh;function Eh(a,b,c){if(a?a.tb:a)return a.tb(0,b,c);var d;d=Eh[q(null==a?null:a)];if(!d&&(d=Eh._,!d))throw x("WritePort.put!",a);return d.call(null,a,b,c)}function Fh(a){if(a?a.sb:a)return a.sb();var b;b=Fh[q(null==a?null:a)];if(!b&&(b=Fh._,!b))throw x("Channel.close!",a);return b.call(null,a)}function Gh(a){if(a?a.Wb:a)return!0;var b;b=Gh[q(null==a?null:a)];if(!b&&(b=Gh._,!b))throw x("Handler.active?",a);return b.call(null,a)}
function Hh(a){if(a?a.Xb:a)return a.ia;var b;b=Hh[q(null==a?null:a)];if(!b&&(b=Hh._,!b))throw x("Handler.commit",a);return b.call(null,a)}function Ih(a,b){if(a?a.Vb:a)return a.Vb(0,b);var c;c=Ih[q(null==a?null:a)];if(!c&&(c=Ih._,!c))throw x("Buffer.add!*",a);return c.call(null,a,b)}
var Jh=function(){function a(a,b){if(null==b)throw Error("Assert failed: "+y.c(Id.g(L([ad(new D(null,"not","not",1044554643,null),ad(new D(null,"nil?","nil?",1612038930,null),new D(null,"itm","itm",-713282527,null)))],0))));return Ih(a,b)}var b=null,b=function(b,d){switch(arguments.length){case 1:return b;case 2:return a.call(this,b,d)}throw Error("Invalid arity: "+arguments.length);};b.c=function(a){return a};b.d=a;return b}();function Kh(a,b,c,d,e){for(var f=0;;)if(f<e)c[d+f]=a[b+f],f+=1;else break}function Lh(a,b,c,d){this.head=a;this.A=b;this.length=c;this.f=d}Lh.prototype.pop=function(){if(0===this.length)return null;var a=this.f[this.A];this.f[this.A]=null;this.A=(this.A+1)%this.f.length;this.length-=1;return a};Lh.prototype.unshift=function(a){this.f[this.head]=a;this.head=(this.head+1)%this.f.length;this.length+=1;return null};function Mh(a,b){a.length+1===a.f.length&&a.resize();a.unshift(b)}
Lh.prototype.resize=function(){var a=Array(2*this.f.length);return this.A<this.head?(Kh(this.f,this.A,a,0,this.length),this.A=0,this.head=this.length,this.f=a):this.A>this.head?(Kh(this.f,this.A,a,0,this.f.length-this.A),Kh(this.f,0,a,this.f.length-this.A,this.head),this.A=0,this.head=this.length,this.f=a):this.A===this.head?(this.head=this.A=0,this.f=a):null};function Nh(a,b){for(var c=a.length,d=0;;)if(d<c){var e=a.pop();(b.c?b.c(e):b.call(null,e))&&a.unshift(e);d+=1}else break}
function Oh(a){if(!(0<a))throw Error("Assert failed: Can't create a ring buffer of size 0\n"+y.c(Id.g(L([ad(new D(null,"\x3e","\x3e",1085014381,null),new D(null,"n","n",-2092305744,null),0)],0))));return new Lh(0,0,0,Array(a))}function Ph(a,b){this.w=a;this.Nc=b;this.t=0;this.j=2}Ph.prototype.Q=function(){return this.w.length};function Qh(a){return a.w.length===a.Nc}Ph.prototype.rb=function(){return this.w.pop()};Ph.prototype.Vb=function(a,b){Mh(this.w,b);return this};
function Rh(a){return new Ph(Oh(a),a)};var Sh=null,Th=Oh(32),Uh=!1,Vh=!1;function Wh(){Uh=!0;Vh=!1;for(var a=0;;){var b=Th.pop();if(null!=b&&(b.n?b.n():b.call(null),1024>a)){a+=1;continue}break}Uh=!1;return 0<Th.length?Xh.n?Xh.n():Xh.call(null):null}"undefined"!==typeof MessageChannel&&(Sh=new MessageChannel,Sh.port1.onmessage=function(){return Wh()});
function Xh(){var a=Vh;if(u(a?Uh:a))return null;Vh=!0;return"undefined"!==typeof MessageChannel?Sh.port2.postMessage(0):"undefined"!==typeof setImmediate?setImmediate(Wh):setTimeout(Wh,0)}function Yh(a){Mh(Th,a);Xh()};var Zh,ai=function $h(b){"undefined"===typeof Zh&&(Zh=function(b,d,e){this.S=b;this.box=d;this.Mc=e;this.t=0;this.j=425984},Zh.Ya=!0,Zh.Xa="cljs.core.async.impl.channels/t15788",Zh.ib=function(b,d){return B(d,"cljs.core.async.impl.channels/t15788")},Zh.prototype.Pa=function(){return this.S},Zh.prototype.G=function(){return this.Mc},Zh.prototype.I=function(b,d){return new Zh(this.S,this.box,d)});return new Zh(b,$h,null)};function bi(a,b){this.jb=a;this.S=b}function ci(a){return Gh(a.jb)}
function di(a){if(a?a.Ub:a)return a.Ub();var b;b=di[q(null==a?null:a)];if(!b&&(b=di._,!b))throw x("MMC.abort",a);return b.call(null,a)}function ei(a,b,c,d,e,f,g){this.Ua=a;this.vb=b;this.Ma=c;this.ub=d;this.w=e;this.closed=f;this.ga=g}
ei.prototype.sb=function(){var a=this;if(!a.closed)for(a.closed=!0,u(function(){var b=a.w;return u(b)?0===a.Ma.length:b}())&&(a.ga.c?a.ga.c(a.w):a.ga.call(null,a.w));;){var b=a.Ua.pop();if(null!=b){var c=b.ia,d=u(function(){var b=a.w;return u(b)?0<O(a.w):b}())?a.w.rb():null;Yh(function(a,b){return function(){return a.c?a.c(b):a.call(null,b)}}(c,d,b,this))}else break}return null};
ei.prototype.Gc=function(a){var b=this;if(null!=b.w&&0<O(b.w)){var c=a.ia;for(a=ai(b.w.rb());;){if(!u(Qh(b.w))){var d=b.Ma.pop();if(null!=d){var e=d.jb,f=d.S;Yh(function(a){return function(){return a.c?a.c(!0):a.call(null,!0)}}(e.ia,e,f,d,c,a,this));hc(b.ga.d?b.ga.d(b.w,f):b.ga.call(null,b.w,f))&&di(this);continue}}break}return a}c=function(){for(;;){var a=b.Ma.pop();if(u(a)){if(Gh(a.jb))return a}else return null}}();if(u(c))return a=Hh(c.jb),Yh(function(a){return function(){return a.c?a.c(!0):a.call(null,
!0)}}(a,c,this)),ai(c.S);if(u(b.closed))return u(b.w)&&(b.ga.c?b.ga.c(b.w):b.ga.call(null,b.w)),u(u(!0)?a.ia:!0)?(c=function(){var a=b.w;return u(a)?0<O(b.w):a}(),c=u(c)?b.w.rb():null,ai(c)):null;64<b.vb?(b.vb=0,Nh(b.Ua,Gh)):b.vb+=1;if(!(1024>b.Ua.length))throw Error("Assert failed: "+y.c("No more than "+y.c(1024)+" pending takes are allowed on a single channel.")+"\n"+y.c(Id.g(L([ad(new D(null,"\x3c","\x3c",993667236,null),ad(new D(null,".-length",".-length",-280799999,null),new D(null,"takes","takes",
298247964,null)),new D("impl","MAX-QUEUE-SIZE","impl/MAX-QUEUE-SIZE",1508600732,null))],0))));Mh(b.Ua,a);return null};
ei.prototype.tb=function(a,b,c){var d=this;if(null==b)throw Error("Assert failed: Can't put nil in on a channel\n"+y.c(Id.g(L([ad(new D(null,"not","not",1044554643,null),ad(new D(null,"nil?","nil?",1612038930,null),new D(null,"val","val",1769233139,null)))],0))));if(a=d.closed)return ai(!a);if(u(function(){var a=d.w;return u(a)?na(Qh(d.w)):a}())){for(c=hc(d.ga.d?d.ga.d(d.w,b):d.ga.call(null,d.w,b));;){if(0<d.Ua.length&&0<O(d.w)){var e=d.Ua.pop(),f=e.ia,g=d.w.rb();Yh(function(a,b){return function(){return a.c?
a.c(b):a.call(null,b)}}(f,g,e,c,a,this))}break}c&&di(this);return ai(!0)}e=function(){for(;;){var a=d.Ua.pop();if(u(a)){if(u(!0))return a}else return null}}();if(u(e))return c=Hh(e),Yh(function(a){return function(){return a.c?a.c(b):a.call(null,b)}}(c,e,a,this)),ai(!0);64<d.ub?(d.ub=0,Nh(d.Ma,ci)):d.ub+=1;if(!(1024>d.Ma.length))throw Error("Assert failed: "+y.c("No more than "+y.c(1024)+" pending puts are allowed on a single channel. Consider using a windowed buffer.")+"\n"+y.c(Id.g(L([ad(new D(null,
"\x3c","\x3c",993667236,null),ad(new D(null,".-length",".-length",-280799999,null),new D(null,"puts","puts",-1883877054,null)),new D("impl","MAX-QUEUE-SIZE","impl/MAX-QUEUE-SIZE",1508600732,null))],0))));Mh(d.Ma,new bi(c,b));return null};ei.prototype.Ub=function(){for(;;){var a=this.Ma.pop();if(null!=a){var b=a.jb;Yh(function(a){return function(){return a.c?a.c(!0):a.call(null,!0)}}(b.ia,b,a.S,a,this))}break}Nh(this.Ma,Cd());return Fh(this)};function fi(a){console.log(a);return null}
function gi(a,b,c){b=(u(b)?b:fi).call(null,c);return null==b?a:Jh.d(a,b)}
var hi=function(){function a(a,b,c){return new ei(Oh(32),0,Oh(32),0,a,!1,function(){return function(a){return function(){function b(d,e){try{return a.d?a.d(d,e):a.call(null,d,e)}catch(f){return gi(d,c,f)}}function d(b){try{return a.c?a.c(b):a.call(null,b)}catch(e){return gi(b,c,e)}}var e=null,e=function(a,c){switch(arguments.length){case 1:return d.call(this,a);case 2:return b.call(this,a,c)}throw Error("Invalid arity: "+arguments.length);};e.c=d;e.d=b;return e}()}(u(b)?b.c?b.c(Jh):b.call(null,Jh):
Jh)}())}function b(a,b){return d.e(a,b,null)}function c(a){return d.d(a,null)}var d=null,d=function(d,f,g){switch(arguments.length){case 1:return c.call(this,d);case 2:return b.call(this,d,f);case 3:return a.call(this,d,f,g)}throw Error("Invalid arity: "+arguments.length);};d.c=c;d.d=b;d.e=a;return d}();var ii,ki=function ji(b){"undefined"===typeof ii&&(ii=function(b,d,e){this.ia=b;this.Eb=d;this.Lc=e;this.t=0;this.j=393216},ii.Ya=!0,ii.Xa="cljs.core.async.impl.ioc-helpers/t15715",ii.ib=function(b,d){return B(d,"cljs.core.async.impl.ioc-helpers/t15715")},ii.prototype.Wb=function(){return!0},ii.prototype.Xb=function(){return this.ia},ii.prototype.G=function(){return this.Lc},ii.prototype.I=function(b,d){return new ii(this.ia,this.Eb,d)});return new ii(b,ji,null)};
function li(a){try{return a[0].call(null,a)}catch(b){throw b instanceof Object&&a[6].sb(),b;}}function mi(a,b,c){c=c.Gc(ki(function(c){a[2]=c;a[1]=b;return li(a)}));return u(c)?(a[2]=M.c?M.c(c):M.call(null,c),a[1]=b,Z):null}function ni(a,b,c,d){c=c.tb(0,d,ki(function(c){a[2]=c;a[1]=b;return li(a)}));return u(c)?(a[2]=M.c?M.c(c):M.call(null,c),a[1]=b,Z):null}function oi(a,b){var c=a[6];null!=b&&c.tb(0,b,ki(function(){return function(){return null}}(c)));c.sb();return c}
function pi(a){for(;;){var b=a[4],c=vg.c(b),d=Rg.c(b),e=a[5];if(u(function(){var a=e;return u(a)?na(b):a}()))throw e;if(u(function(){var a=e;return u(a)?(a=c,u(a)?e instanceof d:a):a}())){a[1]=c;a[2]=e;a[5]=null;a[4]=S.g(b,vg,null,L([Rg,null],0));break}if(u(function(){var a=e;return u(a)?na(c)&&na(jg.c(b)):a}()))a[4]=Ug.c(b);else{if(u(function(){var a=e;return u(a)?(a=na(c))?jg.c(b):a:a}())){a[1]=jg.c(b);a[4]=S.e(b,jg,null);break}if(u(function(){var a=na(e);return a?jg.c(b):a}())){a[1]=jg.c(b);a[4]=
S.e(b,jg,null);break}if(na(e)&&na(jg.c(b))){a[1]=Wg.c(b);a[4]=Ug.c(b);break}throw Error("No matching clause");}}};function qi(a,b,c){this.key=a;this.S=b;this.forward=c;this.t=0;this.j=2155872256}qi.prototype.H=function(a,b,c){return pf(b,vf,"["," ","]",c,this)};qi.prototype.N=function(){return Ha(Ha(I,this.S),this.key)};
(function(){function a(a,b,c){c=Array(c+1);for(var g=0;;)if(g<c.length)c[g]=null,g+=1;else break;return new qi(a,b,c)}function b(a){return c.e(null,null,a)}var c=null,c=function(c,e,f){switch(arguments.length){case 1:return b.call(this,c);case 3:return a.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.c=b;c.e=a;return c})().c(0);var si=function ri(b){"undefined"===typeof Dh&&(Dh=function(b,d,e){this.ia=b;this.Eb=d;this.Kc=e;this.t=0;this.j=393216},Dh.Ya=!0,Dh.Xa="cljs.core.async/t12616",Dh.ib=function(b,d){return B(d,"cljs.core.async/t12616")},Dh.prototype.Wb=function(){return!0},Dh.prototype.Xb=function(){return this.ia},Dh.prototype.G=function(){return this.Kc},Dh.prototype.I=function(b,d){return new Dh(this.ia,this.Eb,d)});return new Dh(b,ri,null)},ti=function(){function a(a,b,c){a=C.d(a,0)?null:a;if(u(b)&&!u(a))throw Error("Assert failed: buffer must be supplied when transducer is\n"+
y.c(Id.g(L([new D(null,"buf-or-n","buf-or-n",-1646815050,null)],0))));return hi.e("number"===typeof a?Rh(a):a,b,c)}function b(a,b){return e.e(a,b,null)}function c(a){return e.e(a,null,null)}function d(){return e.c(null)}var e=null,e=function(e,g,k){switch(arguments.length){case 0:return d.call(this);case 1:return c.call(this,e);case 2:return b.call(this,e,g);case 3:return a.call(this,e,g,k)}throw Error("Invalid arity: "+arguments.length);};e.n=d;e.c=c;e.d=b;e.e=a;return e}(),ui=si(function(){return null}),
vi=function(){function a(a,b,c,d){a=Eh(a,b,si(c));return u(a)?(b=M.c?M.c(a):M.call(null,a),u(d)?c.c?c.c(b):c.call(null,b):Yh(function(a){return function(){return c.c?c.c(a):c.call(null,a)}}(b,a,a)),b):!0}function b(a,b,c){return d.m(a,b,c,!0)}function c(a,b){var c=Eh(a,b,ui);return u(c)?M.c?M.c(c):M.call(null,c):!0}var d=null,d=function(d,f,g,k){switch(arguments.length){case 2:return c.call(this,d,f);case 3:return b.call(this,d,f,g);case 4:return a.call(this,d,f,g,k)}throw Error("Invalid arity: "+
arguments.length);};d.d=c;d.e=b;d.m=a;return d}();W.c?W.c(0):W.call(null,0);function wi(a){return df.g(function(a,c){return Ic(a)&&Ic(c)?cf.g(L([a,c],0)):u(c)?c:a},L([xi,a],0))}function yi(a,b){var c;a:{c=[b];var d=c.length;if(d<=Ce)for(var e=0,f=zb(Be);;)if(e<d)var g=e+1,f=Cb(f,c[e],null),e=g;else{c=new ef(null,Bb(f),null);break a}else for(e=0,f=zb(hf);;)if(e<d)g=e+1,f=Ab(f,c[e]),e=g;else{c=Bb(f);break a}c=void 0}return zd(c,a)}function zi(a,b){return u(a)?a.classList.contains(b):a}
var Bi=function Ai(b,c){if(u(b)){var d=b.hasOwnProperty(c);return u(d)?d:Ai(b.__proto__,c)}return b},Ci=Bi(document,"ontouchstart"),Di=function(){if(!u(document.body))throw"chessground must be included in the \x3cbody\x3e tag!";var a=document.body.style,b=new X(null,4,5,Y,["transform","webkitTransform","mozTransform","oTransform"],null);return F(function(){var c=Qd.d(function(a){return function(b){return Bi(a,b)}}(a,b),b);return u(c)?c:b}())}();
function Ei(a){u(zi(a,"cg-square"))||(u(zi(a,"cg-piece"))?(a=a.parentNode,a=u(zi(a,"cg-square"))?a:null):a=null);return u(a)?a.getAttribute("data-key"):null}
function Fi(a,b){return Sd.d(Be,function(){return function d(b){return new fd(null,function(){for(;;){var f=E(b);if(f){if(Kc(f)){var g=Gb(f),k=O(g),l=kd(k);a:{for(var m=0;;)if(m<k){var n=A.d(g,m),p=Q.e(n,0,null),n=Q.e(n,1,null),p=new X(null,2,5,Y,[p,a.c?a.c(n):a.call(null,n)],null);l.add(p);m+=1}else{g=!0;break a}g=void 0}return g?nd(l.M(),d(Hb(f))):nd(l.M(),null)}g=F(f);l=Q.e(g,0,null);g=Q.e(g,1,null);return N(new X(null,2,5,Y,[l,a.c?a.c(g):a.call(null,g)],null),d(G(f)))}return null}},null,null)}(b)}())}
function Gi(a){return Sd.d(Be,function(){return function c(a){return new fd(null,function(){for(;;){var e=E(a);if(e){if(Kc(e)){var f=Gb(e),g=O(f),k=kd(g);a:{for(var l=0;;)if(l<g){var m=A.d(f,l),n=Q.e(m,0,null),m=Q.e(m,1,null),n=new X(null,2,5,Y,[ed.c(n),m],null);k.add(n);l+=1}else{f=!0;break a}f=void 0}return f?nd(k.M(),c(Hb(e))):nd(k.M(),null)}f=F(e);k=Q.e(f,0,null);f=Q.e(f,1,null);return N(new X(null,2,5,Y,[ed.c(k),f],null),c(G(e)))}return null}},null,null)}(a)}())}
function Hi(a,b){return Ic(Ud.d(a,b))?Xd.e(a,b,Gi):a};var Ch=function(){function a(a,b){return T.d(y,Pd(a,b))}function b(a){return T.d(y,a)}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,c);case 2:return a.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.c=b;c.d=a;return c}();var Ii=new s(null,6,"p pawn r rook n knight b bishop q queen k king".split(" "),null);function Ji(a){Q.e(a,0,null);Xc(a);for(var b=Be,c=0,d=a;;){a=c;var c=d,d=Q.e(c,0,null),c=Xc(c),e=parseInt(d),e=u(isNaN(e))?null:e;if(63<a)return b;if(!C.d(d,"/"))if(null!=e)a+=e;else{var e=a,e=""+y.c(R.d("abcdefgh",(e%8+8)%8))+y.c(8-(e/8|0)),f=d.toLowerCase(),d=new s(null,2,[Kf,R.d(Ii,f),Zf,C.d(d,f)?"black":"white"],null),b=S.e(b,e,d);a+=1}d=c;c=a}}
function Ki(a){return Ji(kf.d(function(a){return xd.d(" ",a)},Rd.d(function(a){return C.d("/",a)},u(a)?a:"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")))};var Li=new X(null,2,5,Y,["white","black"],null),Ni=Sd.d(Be,function Mi(b){return new fd(null,function(){for(var c=b;;){var d=E(c);if(d){var e=d,f=F(e);if(d=E(function(b,c,d,e){return function p(f){return new fd(null,function(b,c){return function(){for(;;){var b=E(f);if(b){if(Kc(b)){var d=Gb(b),e=O(d),g=kd(e);a:{for(var k=0;;)if(k<e){var l=A.d(d,k),l=""+y.c(l)+y.c(c);g.add(new X(null,2,5,Y,[l,new s(null,1,[bg,l],null)],null));k+=1}else{d=!0;break a}d=void 0}return d?nd(g.M(),p(Hb(b))):nd(g.M(),null)}g=
F(b);g=""+y.c(g)+y.c(c);return N(new X(null,2,5,Y,[g,new s(null,1,[bg,g],null)],null),p(G(b)))}return null}}}(b,c,d,e),null,null)}}(c,f,e,d)(new X(null,8,5,Y,"abcdefgh".split(""),null))))return td.d(d,Mi(G(c)));c=G(c)}else return null}},null,null)}(mf.d(1,9)));function Oi(a){return df.g(function(a,c){return S.e(a,lg,c)},L([Ni,Ki(C.d(a,"start")?"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1":a)],0))}
function Pi(a,b){return Sd.d(Be,function(){return function d(a){return new fd(null,function(){for(;;){var f=E(a);if(f){if(Kc(f)){var g=Gb(f),k=O(g),l=kd(k);a:{for(var m=0;;)if(m<k){var n=A.d(g,m),p=Q.e(n,0,null),n=Q.e(n,1,null),p=new X(null,2,5,Y,[p,b.d?b.d(p,n):b.call(null,p,n)],null);l.add(p);m+=1}else{g=!0;break a}g=void 0}return g?nd(l.M(),d(Hb(f))):nd(l.M(),null)}g=F(f);l=Q.e(g,0,null);g=Q.e(g,1,null);return N(new X(null,2,5,Y,[l,b.d?b.d(l,g):b.call(null,l,g)],null),d(G(f)))}return null}},null,
null)}(a)}())}function Qi(a){return Sd.d(Be,Qd.d(sc,function(){return function c(a){return new fd(null,function(){for(;;){var e=E(a);if(e){if(Kc(e)){var f=Gb(e),g=O(f),k=kd(g);a:{for(var l=0;;)if(l<g){var m=A.d(f,l),n=Q.e(m,0,null),m=Q.e(m,1,null),n=new X(null,2,5,Y,[n,lg.c(m)],null);k.add(n);l+=1}else{f=!0;break a}f=void 0}return f?nd(k.M(),c(Hb(e))):nd(k.M(),null)}f=F(e);k=Q.e(f,0,null);f=Q.e(f,1,null);return N(new X(null,2,5,Y,[k,lg.c(f)],null),c(G(e)))}return null}},null,null)}(a)}()))}
function Ri(a,b){return Xd.m(a,new X(null,1,5,Y,[b],null),yc,lg)}function Si(a,b,c){return Xd.v(a,new X(null,1,5,Y,[b],null),S,lg,c)}function Ti(a,b){return ua.e(function(a,b){var e=Q.e(b,0,null),f=Q.e(b,1,null);return u(f)?Si(a,e,f):Ri(a,e)},a,b)}function Ui(a){return F(F(Qd.d(Dd.d(qh,sc),a)))}function Vi(a,b){var c=jf(function(){var c=Ui(a);return u(c)?R.d(b,c):null}());return Pi(a,function(a){return function(b,c){return Qc(a,b)?S.e(c,Mg,!0):yc.d(c,Mg)}}(c))}
function Wi(a){return Fi(function(a){return yc.d(a,Mg)},a)}function Xi(a,b,c){return Vi(Pi(a,function(a,c){return C.d(a,b)?S.e(c,qh,!0):yc.d(c,qh)}),c)}function Zi(a){return Wi(Fi(function(a){return yc.d(a,qh)},a))}function $i(a,b){return Pi(a,function(a,d){return C.d(a,b)?S.e(d,vh,!0):yc.d(d,vh)})}function aj(a,b){var c=Q.e(b,0,null),d=Q.e(b,1,null);return Pi(a,function(a,b,c){return function(a,d){return C.d(a,b)||C.d(a,c)?S.e(d,hg,!0):yc.d(d,hg)}}(b,c,d))}
function bj(a,b){var c=Q.e(b,0,null),d=Q.e(b,1,null);if(xd.d(c,d))var e=Ud.d(a,new X(null,2,5,Y,[c,lg],null)),c=u(e)?Si(Ri(aj(Wi(Zi($i(a,null))),new X(null,2,5,Y,[c,d],null)),c),d,e):null;else c=null;return u(c)?c:a};var xi=new s(null,5,[Of,null,fg,Be,sg,"white",xg,!1,oh,new s(null,6,[ig,!0,Zf,"both",eh,null,gh,"revert",rh,!0,og,new s(null,1,[Kg,function(){return null}],null)],null)],null);function cj(a,b){return S.e(a,fg,Oi(u(b)?b:"start"))}function dj(a){a=Hi(Hi(Gi(a),new X(null,1,5,Y,[oh],null)),new X(null,2,5,Y,[oh,og],null));return yc.d(cj(wi(a),Of.c(a)),Of)}function ej(a,b){var c;c=fg.c(a);c=Zf.c(Ud.d(c,new X(null,2,5,Y,[b,lg],null)));var d=oh.c(a),d=Zf.c(d);return u(c)?C.d(d,"both")||C.d(d,c):c}
function fj(a,b,c){var d=ej(a,b);return u(d)?(d=ig.c(oh.c(a)),u(d)?d:yi(Ud.d(a,new X(null,3,5,Y,[oh,eh,b],null)),c)):d}function gj(a){var b=C.d(a,"white")?"black":"white";return u(yi(Li,b))?b:a};var hj=function(){function a(a,d){var e=null;1<arguments.length&&(e=L(Array.prototype.slice.call(arguments,1),0));return b.call(this,a,e)}function b(a,b){return React.DOM.div.apply(null,va.c(N(a,b)))}a.r=1;a.k=function(a){var d=F(a);a=G(a);return b(d,a)};a.g=b;return a}();
function ij(a,b){React.createClass({render:function(){return this.transferPropsTo(a.c?a.c({children:this.props.children,onChange:this.onChange,value:this.state.value}):a.call(null,{children:this.props.children,onChange:this.onChange,value:this.state.value}))},componentWillReceiveProps:function(a){return this.setState({value:a.value})},onChange:function(a){var b=this.props.onChange;if(null==b)return null;b.c?b.c(a):b.call(null,a);return this.setState({value:a.target.value})},getInitialState:function(){return{value:this.props.value}},
getDisplayName:function(){return b}})}ij(React.DOM.input,"input");ij(React.DOM.textarea,"textarea");ij(React.DOM.option,"option");function jj(){}jj.Hc=function(){return jj.Yb?jj.Yb:jj.Yb=new jj};jj.prototype.Oc=0;var $=!1,kj=null,lj=null,mj=null,nj={};function oj(a){if(a?a.Rc:a)return a.Rc(a);var b;b=oj[q(null==a?null:a)];if(!b&&(b=oj._,!b))throw x("IDisplayName.display-name",a);return b.call(null,a)}var pj={};function qj(a){if(a?a.Sc:a)return a.Sc(a);var b;b=qj[q(null==a?null:a)];if(!b&&(b=qj._,!b))throw x("IInitState.init-state",a);return b.call(null,a)}var rj={};
function sj(a,b,c){if(a?a.Xc:a)return a.Xc(a,b,c);var d;d=sj[q(null==a?null:a)];if(!d&&(d=sj._,!d))throw x("IShouldUpdate.should-update",a);return d.call(null,a,b,c)}var tj={};function uj(a){if(a?a.mc:a)return a.mc();var b;b=uj[q(null==a?null:a)];if(!b&&(b=uj._,!b))throw x("IWillMount.will-mount",a);return b.call(null,a)}var vj={};function wj(a){if(a?a.Gb:a)return a.Gb(a);var b;b=wj[q(null==a?null:a)];if(!b&&(b=wj._,!b))throw x("IDidMount.did-mount",a);return b.call(null,a)}var xj={};
function yj(a){if(a?a.bd:a)return a.bd(a);var b;b=yj[q(null==a?null:a)];if(!b&&(b=yj._,!b))throw x("IWillUnmount.will-unmount",a);return b.call(null,a)}var zj={};function Aj(a,b,c){if(a?a.cd:a)return a.cd(a,b,c);var d;d=Aj[q(null==a?null:a)];if(!d&&(d=Aj._,!d))throw x("IWillUpdate.will-update",a);return d.call(null,a,b,c)}var Bj={};function Cj(a,b,c){if(a?a.$b:a)return a.$b();var d;d=Cj[q(null==a?null:a)];if(!d&&(d=Cj._,!d))throw x("IDidUpdate.did-update",a);return d.call(null,a,b,c)}var Dj={};
function Ej(a,b){if(a?a.ad:a)return a.ad(a,b);var c;c=Ej[q(null==a?null:a)];if(!c&&(c=Ej._,!c))throw x("IWillReceiveProps.will-receive-props",a);return c.call(null,a,b)}var Fj={};function Gj(a){if(a?a.Ib:a)return a.Ib(a);var b;b=Gj[q(null==a?null:a)];if(!b&&(b=Gj._,!b))throw x("IRender.render",a);return b.call(null,a)}var Hj={};function Ij(a,b){if(a?a.Wc:a)return a.Wc(a,b);var c;c=Ij[q(null==a?null:a)];if(!c&&(c=Ij._,!c))throw x("IRenderState.render-state",a);return c.call(null,a,b)}var Jj={};
function Kj(a,b,c,d,e){if(a?a.Uc:a)return a.Uc(a,b,c,d,e);var f;f=Kj[q(null==a?null:a)];if(!f&&(f=Kj._,!f))throw x("IOmSwap.-om-swap!",a);return f.call(null,a,b,c,d,e)}
var Lj=function(){function a(a,b){if(a?a.dc:a)return a.dc(a,b);var c;c=Lj[q(null==a?null:a)];if(!c&&(c=Lj._,!c))throw x("IGetState.-get-state",a);return c.call(null,a,b)}function b(a){if(a?a.cc:a)return a.cc(a);var b;b=Lj[q(null==a?null:a)];if(!b&&(b=Lj._,!b))throw x("IGetState.-get-state",a);return b.call(null,a)}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,c);case 2:return a.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.c=b;c.d=a;return c}(),
Mj=function(){function a(a,b){if(a?a.bc:a)return a.bc(a,b);var c;c=Mj[q(null==a?null:a)];if(!c&&(c=Mj._,!c))throw x("IGetRenderState.-get-render-state",a);return c.call(null,a,b)}function b(a){if(a?a.ac:a)return a.ac(a);var b;b=Mj[q(null==a?null:a)];if(!b&&(b=Mj._,!b))throw x("IGetRenderState.-get-render-state",a);return b.call(null,a)}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,c);case 2:return a.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.c=
b;c.d=a;return c}();function Nj(a){if(a?a.ic:a)return a.ic(a);var b;b=Nj[q(null==a?null:a)];if(!b&&(b=Nj._,!b))throw x("IRenderQueue.-get-queue",a);return b.call(null,a)}function Oj(a,b){if(a?a.jc:a)return a.jc(a,b);var c;c=Oj[q(null==a?null:a)];if(!c&&(c=Oj._,!c))throw x("IRenderQueue.-queue-render!",a);return c.call(null,a,b)}function Pj(a){if(a?a.hc:a)return a.hc(a);var b;b=Pj[q(null==a?null:a)];if(!b&&(b=Pj._,!b))throw x("IRenderQueue.-empty-queue!",a);return b.call(null,a)}
function Qj(a){if(a?a.lc:a)return a.value;var b;b=Qj[q(null==a?null:a)];if(!b&&(b=Qj._,!b))throw x("IValue.-value",a);return b.call(null,a)}Qj._=function(a){return a};var Rj={};function Sj(a){if(a?a.wb:a)return a.wb(a);var b;b=Sj[q(null==a?null:a)];if(!b&&(b=Sj._,!b))throw x("ICursor.-path",a);return b.call(null,a)}function Tj(a){if(a?a.xb:a)return a.xb(a);var b;b=Tj[q(null==a?null:a)];if(!b&&(b=Tj._,!b))throw x("ICursor.-state",a);return b.call(null,a)}
var Uj={},Vj=function(){function a(a,b,c){if(a?a.Zc:a)return a.Zc(a,b,c);var g;g=Vj[q(null==a?null:a)];if(!g&&(g=Vj._,!g))throw x("IToCursor.-to-cursor",a);return g.call(null,a,b,c)}function b(a,b){if(a?a.Yc:a)return a.Yc(a,b);var c;c=Vj[q(null==a?null:a)];if(!c&&(c=Vj._,!c))throw x("IToCursor.-to-cursor",a);return c.call(null,a,b)}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return b.call(this,c,e);case 3:return a.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);};
c.d=b;c.e=a;return c}();function Wj(a,b,c,d){if(a?a.Pc:a)return a.Pc(a,b,c,d);var e;e=Wj[q(null==a?null:a)];if(!e&&(e=Wj._,!e))throw x("ICursorDerive.-derive",a);return e.call(null,a,b,c,d)}Wj._=function(a,b,c,d){return Xj.e?Xj.e(b,c,d):Xj.call(null,b,c,d)};function Yj(a){return Sj(a)}function Zj(a,b,c,d){if(a?a.yb:a)return a.yb(a,b,c,d);var e;e=Zj[q(null==a?null:a)];if(!e&&(e=Zj._,!e))throw x("ITransact.-transact!",a);return e.call(null,a,b,c,d)}var ak={};
function bk(a,b,c){if(a?a.ec:a)return a.ec(a,b,c);var d;d=bk[q(null==a?null:a)];if(!d&&(d=bk._,!d))throw x("INotify.-listen!",a);return d.call(null,a,b,c)}function ck(a,b){if(a?a.gc:a)return a.gc(a,b);var c;c=ck[q(null==a?null:a)];if(!c&&(c=ck._,!c))throw x("INotify.-unlisten!",a);return c.call(null,a,b)}function dk(a,b,c){if(a?a.fc:a)return a.fc(a,b,c);var d;d=dk[q(null==a?null:a)];if(!d&&(d=dk._,!d))throw x("INotify.-notify!",a);return d.call(null,a,b,c)}
function ek(a,b,c,d,e){var f=M.c?M.c(a):M.call(null,a),g=Sd.d(Yj.c?Yj.c(b):Yj.call(null,b),c);c=(a?u(u(null)?null:a.Ad)||(a.U?0:w(Jj,a)):w(Jj,a))?Kj(a,b,c,d,e):Ec(g)?Jd.d(a,d):Jd.m(a,Xd,g,d);if(C.d(c,uh))return null;a=new s(null,5,[Nf,g,rg,Ud.d(f,g),Pf,Ud.d(M.c?M.c(a):M.call(null,a),g),Mf,f,Vf,M.c?M.c(a):M.call(null,a)],null);return null!=e?fk.d?fk.d(b,S.e(a,kh,e)):fk.call(null,b,S.e(a,kh,e)):fk.d?fk.d(b,a):fk.call(null,b,a)}function gk(a){return a?u(u(null)?null:a.Fb)?!0:a.U?!1:w(Rj,a):w(Rj,a)}
function hk(a){var b=a.props.children;if(Ac(b)){var c=a.props,d;a:{var e=$;try{$=!0;d=b.c?b.c(a):b.call(null,a);break a}finally{$=e}d=void 0}a=c.children=d}else a=b;return a}function ik(a){return a.props.__om_cursor}
var jk=function(){function a(a,b){var c=Hc(b)?b:new X(null,1,5,Y,[b],null);return Lj.d(a,c)}function b(a){return Lj.c(a)}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,c);case 2:return a.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.c=b;c.d=a;return c}(),kk=function(){function a(a,b){return Hc(b)?Ec(b)?c.c(a):Ud.d(c.c(a),b):R.d(c.c(a),b)}function b(a){return null==a?null:a.props.__om_shared}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,
c);case 2:return a.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.c=b;c.d=a;return c}();function lk(a){a=a.state;var b=a.__om_pending_state;return u(b)?(a.__om_prev_state=a.__om_state,a.__om_state=b,a.__om_pending_state=null,a):null}
var mk=function(){function a(a,b){var c=u(b)?b:a.props,g=c.__om_state;if(u(g)){var k=a.state,l=k.__om_pending_state;k.__om_pending_state=cf.g(L([u(l)?l:k.__om_state,g],0));return c.__om_state=null}return null}function b(a){return c.d(a,null)}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,c);case 2:return a.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.c=b;c.d=a;return c}(),nk=xc([Tf,yg,zg,Dg,Jg,Og,Qg,fh,mh,sh],[function(a){var b=hk(this);if(b?u(u(null)?
null:b.Qc)||(b.U?0:w(Bj,b)):w(Bj,b)){var c=this.state,d=$;try{$=!0;var e=c.__om_prev_state;Cj(b,ik({props:a}),u(e)?e:c.__om_state)}finally{$=d}}return this.state.__om_prev_state=null},function(){var a=hk(this);if(a?u(u(null)?null:a.Id)||(a.U?0:w(xj,a)):w(xj,a)){var b=$;try{return $=!0,yj(a)}finally{$=b}}else return null},function(a){var b=hk(this);if(b?u(u(null)?null:b.Hd)||(b.U?0:w(Dj,b)):w(Dj,b)){var c=$;try{return $=!0,Ej(b,ik({props:a}))}finally{$=c}}else return null},function(a){var b=$;try{$=
!0;var c=this.props,d=this.state,e=hk(this);mk.d(this,a);return(e?u(u(null)?null:e.Fd)||(e.U?0:w(rj,e)):w(rj,e))?sj(e,ik({props:a}),Lj.c(this)):xd.d(Qj(c.__om_cursor),Qj(a.__om_cursor))?!0:null!=d.__om_pending_state?!0:c.__om_index!==a.__om_index?!0:!1}finally{$=b}},function(){var a=hk(this),b=this.props,c=$;try{if($=!0,a?u(u(null)?null:a.Hb)||(a.U?0:w(Fj,a)):w(Fj,a)){var d=kj,e=mj,f=lj;try{return kj=this,mj=b.__om_app_state,lj=b.__om_instrument,Gj(a)}finally{lj=f,mj=e,kj=d}}else if(a?u(u(null)?null:
a.Vc)||(a.U?0:w(Hj,a)):w(Hj,a)){d=kj;e=mj;f=lj;try{return kj=this,mj=b.__om_app_state,lj=b.__om_instrument,Ij(a,jk.c(this))}finally{lj=f,mj=e,kj=d}}else return a}finally{$=c}},function(a){var b=hk(this);if(b?u(u(null)?null:b.Jd)||(b.U?0:w(zj,b)):w(zj,b)){var c=$;try{$=!0,Aj(b,ik({props:a}),Lj.c(this))}finally{$=c}}return lk(this)},function(){var a=hk(this),b=this.props,c=function(){var a=b.__om_init_state;return u(a)?a:Be}(),d=$f.c(c),c={__om_state:cf.g(L([(a?u(u(null)?null:a.zd)||(a.U?0:w(pj,a)):
w(pj,a))?function(){var b=$;try{return $=!0,qj(a)}finally{$=b}}():null,yc.d(c,$f)],0)),__om_id:u(d)?d:":"+(jj.Hc().Oc++).toString(36)};b.__om_init_state=null;return c},function(){var a=hk(this);if(a?u(u(null)?null:a.Zb)||(a.U?0:w(vj,a)):w(vj,a)){var b=$;try{return $=!0,wj(a)}finally{$=b}}else return null},function(){var a=hk(this);if(a?u(u(null)?null:a.wd)||(a.U?0:w(nj,a)):w(nj,a)){var b=$;try{return $=!0,oj(a)}finally{$=b}}else return null},function(){mk.c(this);var a=hk(this);if(a?u(u(null)?null:
a.$c)||(a.U?0:w(tj,a)):w(tj,a)){var b=$;try{$=!0,uj(a)}finally{$=b}}return lk(this)}]),ok=function(a){a.yd=!0;a.cc=function(){return function(){var a=this.state,c=a.__om_pending_state;return u(c)?c:a.__om_state}}(a);a.dc=function(){return function(a,c){return Ud.d(Lj.c(this),c)}}(a);a.xd=!0;a.ac=function(){return function(){return this.state.__om_state}}(a);a.bc=function(){return function(a,c){return Ud.d(Mj.c(this),c)}}(a);a.Cd=!0;a.Dd=function(){return function(a,c,d){a=$;try{$=!0;var e=this.props.__om_app_state;
this.state.__om_pending_state=c;c=null!=e;return u(c?d:c)?Oj(e,this):null}finally{$=a}}}(a);a.Ed=function(){return function(a,c,d,e){a=$;try{$=!0;var f=this.props,g=this.state,k=Lj.c(this),l=f.__om_app_state;g.__om_pending_state=Wd(k,c,d);c=null!=l;return u(c?e:c)?Oj(l,this):null}finally{$=a}}}(a);return a}(Df(nk));function pk(a,b,c){this.value=a;this.state=b;this.path=c;this.j=2162591503;this.t=8192}h=pk.prototype;h.B=function(a,b){return Pa.e(this,b,null)};
h.C=function(a,b,c){if($)return a=Pa.e(this.value,b,c),C.d(a,c)?c:Wj(this,a,this.state,uc.d(this.path,b));throw Error("Cannot manipulate cursor outside of render phase, only om.core/transact!, om.core/update!, and cljs.core/deref operations allowed");};h.H=function(a,b,c){if($)return vb(this.value,b,c);throw Error("Cannot manipulate cursor outside of render phase, only om.core/transact!, om.core/update!, and cljs.core/deref operations allowed");};h.Fb=!0;h.wb=function(){return this.path};h.xb=function(){return this.state};
h.G=function(){if($)return Cc(this.value);throw Error("Cannot manipulate cursor outside of render phase, only om.core/transact!, om.core/update!, and cljs.core/deref operations allowed");};h.ca=function(){return new pk(this.value,this.state,this.path)};h.Q=function(){if($)return Da(this.value);throw Error("Cannot manipulate cursor outside of render phase, only om.core/transact!, om.core/update!, and cljs.core/deref operations allowed");};
h.K=function(){if($)return Xb(this.value);throw Error("Cannot manipulate cursor outside of render phase, only om.core/transact!, om.core/update!, and cljs.core/deref operations allowed");};h.F=function(a,b){if($)return gk(b)?C.d(this.value,Qj(b)):C.d(this.value,b);throw Error("Cannot manipulate cursor outside of render phase, only om.core/transact!, om.core/update!, and cljs.core/deref operations allowed");};h.lc=function(){return this.value};
h.R=function(){if($)return new pk(vc(this.value),this.state,this.path);throw Error("Cannot manipulate cursor outside of render phase, only om.core/transact!, om.core/update!, and cljs.core/deref operations allowed");};h.pb=function(a,b){if($)return new pk(Va(this.value,b),this.state,this.path);throw Error("Cannot manipulate cursor outside of render phase, only om.core/transact!, om.core/update!, and cljs.core/deref operations allowed");};h.kc=!0;
h.yb=function(a,b,c,d){return ek(this.state,this,b,c,d)};h.eb=function(a,b){if($)return Qa(this.value,b);throw Error("Cannot manipulate cursor outside of render phase, only om.core/transact!, om.core/update!, and cljs.core/deref operations allowed");};h.Oa=function(a,b,c){if($)return new pk(Sa(this.value,b,c),this.state,this.path);throw Error("Cannot manipulate cursor outside of render phase, only om.core/transact!, om.core/update!, and cljs.core/deref operations allowed");};
h.N=function(){var a=this;if($)return 0<O(a.value)?Kd.d(function(b){return function(c){var d=Q.e(c,0,null);c=Q.e(c,1,null);return new X(null,2,5,Y,[d,Wj(b,c,a.state,uc.d(a.path,d))],null)}}(this),a.value):null;throw Error("Cannot manipulate cursor outside of render phase, only om.core/transact!, om.core/update!, and cljs.core/deref operations allowed");};
h.I=function(a,b){if($)return new pk(qc(this.value,b),this.state,this.path);throw Error("Cannot manipulate cursor outside of render phase, only om.core/transact!, om.core/update!, and cljs.core/deref operations allowed");};h.P=function(a,b){if($)return new pk(Ha(this.value,b),this.state,this.path);throw Error("Cannot manipulate cursor outside of render phase, only om.core/transact!, om.core/update!, and cljs.core/deref operations allowed");};
h.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.B(null,c);case 3:return this.C(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.d=function(a,c){return this.B(null,c)};a.e=function(a,c,d){return this.C(null,c,d)};return a}();h.apply=function(a,b){return this.call.apply(this,[this].concat(ra(b)))};h.c=function(a){return this.B(null,a)};h.d=function(a,b){return this.C(null,a,b)};
h.Pa=function(){if($)throw Error("Cannot deref cursor during render phase: "+y.c(this));return Ud.d(M.c?M.c(this.state):M.call(null,this.state),this.path)};function qk(a,b,c){this.value=a;this.state=b;this.path=c;this.j=2179375903;this.t=8192}h=qk.prototype;h.B=function(a,b){if($)return A.e(this,b,null);throw Error("Cannot manipulate cursor outside of render phase, only om.core/transact!, om.core/update!, and cljs.core/deref operations allowed");};
h.C=function(a,b,c){if($)return A.e(this,b,c);throw Error("Cannot manipulate cursor outside of render phase, only om.core/transact!, om.core/update!, and cljs.core/deref operations allowed");};h.L=function(a,b){if($)return Wj(this,A.d(this.value,b),this.state,uc.d(this.path,b));throw Error("Cannot manipulate cursor outside of render phase, only om.core/transact!, om.core/update!, and cljs.core/deref operations allowed");};
h.$=function(a,b,c){if($)return b<Da(this.value)?Wj(this,A.d(this.value,b),this.state,uc.d(this.path,b)):c;throw Error("Cannot manipulate cursor outside of render phase, only om.core/transact!, om.core/update!, and cljs.core/deref operations allowed");};h.H=function(a,b,c){if($)return vb(this.value,b,c);throw Error("Cannot manipulate cursor outside of render phase, only om.core/transact!, om.core/update!, and cljs.core/deref operations allowed");};h.Fb=!0;h.wb=function(){return this.path};h.xb=function(){return this.state};
h.G=function(){if($)return Cc(this.value);throw Error("Cannot manipulate cursor outside of render phase, only om.core/transact!, om.core/update!, and cljs.core/deref operations allowed");};h.ca=function(){return new qk(this.value,this.state,this.path)};h.Q=function(){if($)return Da(this.value);throw Error("Cannot manipulate cursor outside of render phase, only om.core/transact!, om.core/update!, and cljs.core/deref operations allowed");};
h.K=function(){if($)return Xb(this.value);throw Error("Cannot manipulate cursor outside of render phase, only om.core/transact!, om.core/update!, and cljs.core/deref operations allowed");};h.F=function(a,b){if($)return gk(b)?C.d(this.value,Qj(b)):C.d(this.value,b);throw Error("Cannot manipulate cursor outside of render phase, only om.core/transact!, om.core/update!, and cljs.core/deref operations allowed");};h.lc=function(){return this.value};
h.R=function(){if($)return new qk(vc(this.value),this.state,this.path);throw Error("Cannot manipulate cursor outside of render phase, only om.core/transact!, om.core/update!, and cljs.core/deref operations allowed");};h.kc=!0;h.yb=function(a,b,c,d){return ek(this.state,this,b,c,d)};h.eb=function(a,b){if($)return Qa(this.value,b);throw Error("Cannot manipulate cursor outside of render phase, only om.core/transact!, om.core/update!, and cljs.core/deref operations allowed");};
h.Oa=function(a,b,c){if($)return Wj(this,cb(this.value,b,c),this.state,this.path);throw Error("Cannot manipulate cursor outside of render phase, only om.core/transact!, om.core/update!, and cljs.core/deref operations allowed");};
h.N=function(){var a=this;if($)return 0<O(a.value)?Kd.e(function(b){return function(c,d){return Wj(b,c,a.state,uc.d(a.path,d))}}(this),a.value,mf.n()):null;throw Error("Cannot manipulate cursor outside of render phase, only om.core/transact!, om.core/update!, and cljs.core/deref operations allowed");};
h.I=function(a,b){if($)return new qk(qc(this.value,b),this.state,this.path);throw Error("Cannot manipulate cursor outside of render phase, only om.core/transact!, om.core/update!, and cljs.core/deref operations allowed");};h.P=function(a,b){if($)return new qk(Ha(this.value,b),this.state,this.path);throw Error("Cannot manipulate cursor outside of render phase, only om.core/transact!, om.core/update!, and cljs.core/deref operations allowed");};
h.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.B(null,c);case 3:return this.C(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.d=function(a,c){return this.B(null,c)};a.e=function(a,c,d){return this.C(null,c,d)};return a}();h.apply=function(a,b){return this.call.apply(this,[this].concat(ra(b)))};h.c=function(a){return this.B(null,a)};h.d=function(a,b){return this.C(null,a,b)};
h.Pa=function(){if($)throw Error("Cannot deref cursor during render phase: "+y.c(this));return Ud.d(M.c?M.c(this.state):M.call(null,this.state),this.path)};
function rk(a,b,c){var d=Aa(a);d.uc=!0;d.F=function(){return function(b,c){if($)return gk(c)?C.d(a,Qj(c)):C.d(a,c);throw Error("Cannot manipulate cursor outside of render phase, only om.core/transact!, om.core/update!, and cljs.core/deref operations allowed");}}(d);d.kc=!0;d.yb=function(){return function(a,c,d,k){return ek(b,this,c,d,k)}}(d);d.Fb=!0;d.wb=function(){return function(){return c}}(d);d.xb=function(){return function(){return b}}(d);d.md=!0;d.Pa=function(){return function(){if($)throw Error("Cannot deref cursor during render phase: "+
y.c(this));return Ud.d(M.c?M.c(b):M.call(null,b),c)}}(d);return d}
var Xj=function(){function a(a,b,c){return gk(a)?a:(a?u(u(null)?null:a.Gd)||(a.U?0:w(Uj,a)):w(Uj,a))?Vj.e(a,b,c):mc(a)?new qk(a,b,c):Ic(a)?new pk(a,b,c):(a?a.t&8192||a.kd||(a.t?0:w(za,a)):w(za,a))?rk(a,b,c):a}function b(a,b){return d.e(a,b,tc)}function c(a){return d.e(a,null,tc)}var d=null,d=function(d,f,g){switch(arguments.length){case 1:return c.call(this,d);case 2:return b.call(this,d,f);case 3:return a.call(this,d,f,g)}throw Error("Invalid arity: "+arguments.length);};d.c=c;d.d=b;d.e=a;return d}();
function fk(a,b){var c=Tj(a);return dk(c,b,Xj.d(M.c?M.c(c):M.call(null,c),c))}var sk=!1,tk=W.c?W.c(hf):W.call(null,hf);function uk(){sk=!1;for(var a=E(M.c?M.c(tk):M.call(null,tk)),b=null,c=0,d=0;;)if(d<c){var e=b.L(null,d);e.n?e.n():e.call(null);d+=1}else if(a=E(a))b=a,Kc(b)?(a=Gb(b),c=Hb(b),b=a,e=O(a),a=c,c=e):(e=F(b),e.n?e.n():e.call(null),a=K(b),b=null,c=0),d=0;else return null}var vk=W.c?W.c(Be):W.call(null,Be);
function wk(a,b){var c=a?u(u(null)?null:a.Hb)?!0:a.U?!1:w(Fj,a):w(Fj,a);if(!(c?c:a?u(u(null)?null:a.Vc)||(a.U?0:w(Hj,a)):w(Hj,a)))throw Error("Assert failed: "+y.c("Invalid Om component fn, "+y.c(b.name)+" does not return valid instance")+"\n"+y.c(Id.g(L([ad(new D(null,"or","or",1876275696,null),ad(new D(null,"satisfies?","satisfies?",-433227199,null),new D(null,"IRender","IRender",590822196,null),new D(null,"x","x",-555367584,null)),ad(new D(null,"satisfies?","satisfies?",-433227199,null),new D(null,
"IRenderState","IRenderState",-897673898,null),new D(null,"x","x",-555367584,null)))],0))));}
var xk=function(){function a(a,b){null==a.om$descriptor&&(a.om$descriptor=React.createClass(u(b)?b:ok));return a.om$descriptor}function b(a){return c.d(a,null)}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,c);case 2:return a.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.c=b;c.d=a;return c}(),yk=function(){function a(a,b,c){if(!yd(new ef(null,new s(null,10,[Rf,null,Uf,null,Wf,null,Xf,null,bg,null,ug,null,wg,null,Sg,null,Xg,null,$g,null],null),null),
bf(c)))throw Error("Assert failed: "+y.c(T.m(y,"build options contains invalid keys, only :key, :react-key, ",":fn, :init-state, :state, and :opts allowed, given ",Pd(", ",bf(c))))+"\n"+y.c(Id.g(L([ad(new D(null,"valid?","valid?",1428119148,null),new D(null,"m","m",-1021758608,null))],0))));if(null==c){var g=function(){var a=$g.c(c);return u(a)?a:kk.c(kj)}(),k=xk.d(a,Rf.c(c));return k.c?k.c({children:function(){return function(c){var f=$;try{$=!0;var g=a.d?a.d(b,c):a.call(null,b,c);wk(g,a);return g}finally{$=
f}}}(g,k),__om_instrument:lj,__om_app_state:mj,__om_shared:g,__om_cursor:b}):k.call(null,{children:function(){return function(c){var f=$;try{$=!0;var g=a.d?a.d(b,c):a.call(null,b,c);wk(g,a);return g}finally{$=f}}}(g,k),__om_instrument:lj,__om_app_state:mj,__om_shared:g,__om_cursor:b})}var l=Oc(c)?T.d(Fd,c):c,m=R.d(l,Sg),n=R.d(l,ug),p=R.d(l,wg),r=R.d(l,bg),t=R.d(c,Uf),v=null!=t?function(){var a=Xg.c(c);return u(a)?t.d?t.d(b,a):t.call(null,b,a):t.c?t.c(b):t.call(null,b)}():b,z=null!=r?R.d(v,r):R.d(c,
Xf),g=function(){var a=$g.c(c);return u(a)?a:kk.c(kj)}(),k=xk.d(a,Rf.c(c));return k.c?k.c({__om_shared:g,__om_index:Xg.c(c),__om_cursor:v,__om_app_state:mj,key:z,__om_init_state:n,children:null==m?function(b,c,e,f,g,k,l,m){return function(b){var c=$;try{$=!0;var e=a.d?a.d(m,b):a.call(null,m,b);wk(e,a);return e}finally{$=c}}}(c,l,m,n,p,r,t,v,z,g,k):function(b,c,e,f,g,k,l,m){return function(b){var c=$;try{$=!0;var f=a.e?a.e(m,b,e):a.call(null,m,b,e);wk(f,a);return f}finally{$=c}}}(c,l,m,n,p,r,t,v,z,
g,k),__om_instrument:lj,__om_state:p}):k.call(null,{__om_shared:g,__om_index:Xg.c(c),__om_cursor:v,__om_app_state:mj,key:z,__om_init_state:n,children:null==m?function(b,c,e,f,g,k,l,m){return function(b){var c=$;try{$=!0;var e=a.d?a.d(m,b):a.call(null,m,b);wk(e,a);return e}finally{$=c}}}(c,l,m,n,p,r,t,v,z,g,k):function(b,c,e,f,g,k,l,m){return function(b){var c=$;try{$=!0;var f=a.e?a.e(m,b,e):a.call(null,m,b,e);wk(f,a);return f}finally{$=c}}}(c,l,m,n,p,r,t,v,z,g,k),__om_instrument:lj,__om_state:p})}
function b(a,b){return c.e(a,b,null)}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return b.call(this,c,e);case 3:return a.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.d=b;c.e=a;return c}(),zk=function(){function a(a,b,c){if(null!=lj){var g;a:{var k=$;try{$=!0;g=lj.e?lj.e(a,b,c):lj.call(null,a,b,c);break a}finally{$=k}g=void 0}return C.d(g,tg)?yk.e(a,b,c):g}return yk.e(a,b,c)}function b(a,b){return c.e(a,b,null)}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return b.call(this,
c,e);case 3:return a.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.d=b;c.e=a;return c}();
function Ak(a,b,c){if(!(a?u(u(null)?null:a.Tc)||(a.U?0:w(ak,a)):w(ak,a))){var d=W.c?W.c(Be):W.call(null,Be),e=W.c?W.c(hf):W.call(null,hf);a.Bd=!0;a.ic=function(a,b,c){return function(){return M.c?M.c(c):M.call(null,c)}}(a,d,e);a.jc=function(a,b,c){return function(a,b){if(Qc(M.c?M.c(c):M.call(null,c),b))return null;Jd.e(c,uc,b);return Jd.d(this,Ad)}}(a,d,e);a.hc=function(a,b,c){return function(){return Jd.d(c,vc)}}(a,d,e);a.Tc=!0;a.ec=function(a,b){return function(a,c,d){null!=d&&Jd.m(b,S,c,d);return this}}(a,
d,e);a.gc=function(a,b){return function(a,c){Jd.e(b,yc,c);return this}}(a,d,e);a.fc=function(a,b){return function(a,c,d){a=E(M.c?M.c(b):M.call(null,b));for(var e=null,f=0,r=0;;)if(r<f){var t=e.L(null,r);Q.e(t,0,null);t=Q.e(t,1,null);t.d?t.d(c,d):t.call(null,c,d);r+=1}else if(a=E(a))Kc(a)?(f=Gb(a),a=Hb(a),e=f,f=O(f)):(e=F(a),Q.e(e,0,null),e=Q.e(e,1,null),e.d?e.d(c,d):e.call(null,c,d),a=K(a),e=null,f=0),r=0;else break;return this}}(a,d,e)}return bk(a,b,c)}
function Bk(a,b,c){var d=Oc(c)?T.d(Fd,c):c,e=R.d(d,Wf),f=R.d(d,Nf),g=R.d(d,yh),k=R.d(d,lh);if(null==k)throw Error("Assert failed: No target specified to om.core/root\n"+y.c(Id.g(L([ad(new D(null,"not","not",1044554643,null),ad(new D(null,"nil?","nil?",1612038930,null),new D(null,"target","target",1893533248,null)))],0))));var l=M.c?M.c(vk):M.call(null,vk);Qc(l,k)&&R.d(l,k).call(null);l=zf.n();b=(b?b.t&16384||b.hd||(b.t?0:w(Jb,b)):w(Jb,b))?b:W.c?W.c(b):W.call(null,b);var m=Ak(b,l,g),n=yc.g(d,lh,L([yh,
Nf],0)),p=function(b,c,d,e,f,g,k,l,m,n,p){return function ea(){Jd.e(tk,Dc,ea);var b=M.c?M.c(d):M.call(null,d),b=null==m?Xj.e(b,d,tc):Xj.e(Ud.d(b,m),d,m),c;a:{var f=lj,g=mj;try{lj=l;mj=d;c=zk.e(a,b,e);break a}finally{mj=g,lj=f}c=void 0}React.renderComponent(c,p);c=Nj(d);if(Ec(c))return null;c=E(c);b=null;for(g=f=0;;)if(g<f){var k=b.L(null,g);u(k.isMounted())&&k.forceUpdate();g+=1}else if(c=E(c))b=c,Kc(b)?(c=Gb(b),g=Hb(b),b=c,f=O(c),c=g):(c=F(b),u(c.isMounted())&&c.forceUpdate(),c=K(b),b=null,f=0),
g=0;else break;return Pj(d)}}(l,b,m,n,c,d,d,e,f,g,k);xf(m,l,function(a,b,c,d,e){return function(){Qc(M.c?M.c(tk):M.call(null,tk),e)||Jd.e(tk,uc,e);if(u(sk))return null;sk=!0;return"undefined"!==typeof requestAnimationFrame?requestAnimationFrame(uk):setTimeout(uk,16)}}(l,b,m,n,p,c,d,d,e,f,g,k));Jd.m(vk,S,k,function(a,b,c,d,e,f,g,k,l,m,n,p){return function(){yb(c,a);ck(c,a);Jd.e(vk,yc,p);return React.unmountComponentAtNode(p)}}(l,b,m,n,p,c,d,d,e,f,g,k));p()}
var Ck=function(){function a(a,b,c,d){b=null==b?tc:Hc(b)?b:new X(null,1,5,Y,[b],null);return Zj(a,b,c,d)}function b(a,b,c){return d.m(a,b,c,null)}function c(a,b){return d.m(a,tc,b,null)}var d=null,d=function(d,f,g,k){switch(arguments.length){case 2:return c.call(this,d,f);case 3:return b.call(this,d,f,g);case 4:return a.call(this,d,f,g,k)}throw Error("Invalid arity: "+arguments.length);};d.d=c;d.e=b;d.m=a;return d}(),Dk=function(){function a(a,b,c,d){return Ck.m(a,b,function(){return c},d)}function b(a,
b,c){return Ck.m(a,b,function(){return c},null)}function c(a,b){return Ck.m(a,tc,function(){return b},null)}var d=null,d=function(d,f,g,k){switch(arguments.length){case 2:return c.call(this,d,f);case 3:return b.call(this,d,f,g);case 4:return a.call(this,d,f,g,k)}throw Error("Invalid arity: "+arguments.length);};d.d=c;d.e=b;d.m=a;return d}(),Ek=function(){function a(a,b){var c=a.refs;return u(c)?c[b].getDOMNode():null}function b(a){return a.getDOMNode()}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,
c);case 2:return a.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.c=b;c.d=a;return c}();function Fk(a){function b(b,c){var f=ti.n(),g=ti.c(1);Yh(function(f,g){return function(){var m=function(){return function(a){return function(){function b(c){for(;;){var d;a:{try{for(;;){var e=a(c);if(!cd(e,Z)){d=e;break a}}}catch(f){if(f instanceof Object){c[5]=f;pi(c);d=Z;break a}throw f;}d=void 0}if(!cd(d,Z))return d}}function c(){var a=[null,null,null,null,null,null,null,null,null];a[0]=d;a[1]=1;return a}var d=null,d=function(a){switch(arguments.length){case 0:return c.call(this);case 1:return b.call(this,
a)}throw Error("Invalid arity: "+arguments.length);};d.n=c;d.c=b;return d}()}(function(f,g){return function(f){var k=f[1];if(3===k){var k=Df(f[2]),k=c.c?c.c(k):c.call(null,k),l=Fh(g);f[7]=k;return oi(f,l)}return 2===k?(f[8]=f[2],mi(f,3,g)):1===k?(k=new X(null,2,5,Y,[b,g],null),ni(f,2,a,k)):null}}(f,g),f,g)}(),n=function(){var a=m.n?m.n():m.call(null);a[6]=f;return a}();return li(n)}}(g,f));return g}function c(b,c){return vi.d(a,new X(null,2,5,Y,[b,c],null))}return Df(xc([Qf,Yf,kg,qg,Cg,Fg,Ng,Tg,Yg,
jh,nh,ph,xh,zh],[function(a){return c(Ig,If.c(a))},function(a,b){return c(eg,new X(null,2,5,Y,[a,b],null))},function(a){return b(ch,a)},function(a,b){return c(Hg,new X(null,2,5,Y,[a,b],null))},function(a){return c(hh,a)},function(){return c(hh,"start")},function(a){return c(cg,a)},function(a){return c(ng,Fi(Gi,If.g(a,L([new s(null,1,[Hf,!0],null)],0))))},function(a){return b(Ag,a)},function(){return c(ag,null)},function(a){return c(th,a)},function(a){return b(Bg,a)},function(a){return c(mg,a)},function(){return c(zh,
null)}]))}
function Gk(a,b){var c=ti.c(1);Yh(function(c){return function(){var e=function(){return function(a){return function(){function b(c){for(;;){var d;a:{try{for(;;){var e=a(c);if(!cd(e,Z)){d=e;break a}}}catch(f){if(f instanceof Object){c[5]=f;pi(c);d=Z;break a}throw f;}d=void 0}if(!cd(d,Z))return d}}function c(){var a=[null,null,null,null,null,null,null,null,null,null,null];a[0]=d;a[1]=1;return a}var d=null,d=function(a){switch(arguments.length){case 0:return c.call(this);case 1:return b.call(this,a)}throw Error("Invalid arity: "+
arguments.length);};d.n=c;d.c=b;return d}()}(function(c){return function(d){var e=d[1];if(7===e){var f=Ck.e(a,sg,gj);d[2]=f;d[1]=5;return Z}if(20===e){var n=d[7],p=d[8],r=d[9],f=Ck.e(a,fg,function(){return function(a){return function(b){return aj(b,a)}}(p,n,r,n,p,r,e,c)}());d[2]=f;d[1]=5;return Z}if(1===e)return d[2]=null,d[1]=2,Z;if(24===e)return n=d[7],p=d[8],r=d[9],f=Ck.d(a,function(){return function(a){return function(b){return u(yi(uc.g(Li,"both",L(["none"],0)),a))?Wd(b,new X(null,2,5,Y,[oh,
Zf],null),a):b}}(p,n,r,n,p,r,e,c)}()),d[2]=f,d[1]=5,Z;if(4===e){var n=d[7],r=d[9],t=d[2],f=Q.e(t,0,null),p=Q.e(t,1,null);d[7]=f;d[8]=p;d[9]=t;switch(f instanceof V?f.ra:null){case "toggle-orientation":d[1]=7;break;case "set-color":d[1]=24;break;case "set-last-move":d[1]=20;break;case "set-check":d[1]=21;break;case "set-pieces":d[1]=22;break;case "get-position":d[1]=10;break;case "get-orientation":d[1]=8;break;case "api-move":d[1]=19;break;case "set-dests":d[1]=23;break;case "get-color":d[1]=12;break;
case "set-fen":d[1]=14;break;case "set-orientation":d[1]=6;break;case "clear":d[1]=18;break;default:throw Error("No matching clause: "+y.c(f));}return Z}return 15===e?(p=d[8],d[2]=p,d[1]=17,Z):21===e?(n=d[7],p=d[8],r=d[9],f=Ck.e(a,fg,function(){return function(a){return function(b){return $i(b,a)}}(p,n,r,n,p,r,e,c)}()),d[2]=f,d[1]=5,Z):13===e?(f=d[2],d[2]=f,d[1]=5,Z):22===e?(n=d[7],p=d[8],r=d[9],f=Ck.e(a,fg,function(){return function(a){return function(b){return Ti(b,a)}}(p,n,r,n,p,r,e,c)}()),d[2]=
f,d[1]=5,Z):6===e?(n=d[7],p=d[8],r=d[9],f=Ck.e(a,sg,function(){return function(a){return function(b){return u(yi(Li,a))?a:b}}(p,n,r,n,p,r,e,c)}()),d[2]=f,d[1]=5,Z):17===e?(f=Oi(d[2]),f=Dk.e(a,fg,f),d[2]=f,d[1]=5,Z):3===e?(f=d[2],oi(d,f)):12===e?(p=d[8],f=M.c?M.c(a):M.call(null,a),f=oh.c(f),f=Zf.c(f),ni(d,13,p,f)):2===e?mi(d,4,b):23===e?(n=d[7],p=d[8],r=d[9],f=Ck.d(a,function(){return function(a){return function(b){b=Wd(Wd(b,new X(null,2,5,Y,[oh,eh],null),a),new X(null,2,5,Y,[oh,ig],null),!1);return Xd.m(b,
new X(null,1,5,Y,[fg],null),Vi,eh.c(oh.c(b)))}}(p,n,r,n,p,r,e,c)}()),d[2]=f,d[1]=5,Z):19===e?(n=d[7],p=d[8],r=d[9],f=Ck.e(a,fg,function(){return function(a){return function(b){return bj(b,a)}}(p,n,r,n,p,r,e,c)}()),d[2]=f,d[1]=5,Z):11===e||9===e?(f=d[2],d[2]=f,d[1]=5,Z):5===e?(d[10]=d[2],d[2]=null,d[1]=2,Z):14===e?(p=d[8],d[1]=u(p)?15:16,Z):16===e?(d[2]="start",d[1]=17,Z):10===e?(p=d[8],f=M.c?M.c(a):M.call(null,a),f=fg.c(f),f=Qi(f),ni(d,11,p,f)):18===e?(f=Dk.e(a,fg,Ni),d[2]=f,d[1]=5,Z):8===e?(p=d[8],
f=M.c?M.c(a):M.call(null,a),f=sg.c(f),ni(d,9,p,f)):null}}(c),c)}(),f=function(){var a=e.n?e.n():e.call(null);a[6]=c;return a}();return li(f)}}(c))};var Hk="cg-"+y.c(Math.random().toString(36).substring(2)),Ik=W.c?W.c(0):W.call(null,0),Jk=W.c?W.c(Be):W.call(null,Be);function Kk(a){a=a[Hk];return u(a)?Ud.d(M.c?M.c(Jk):M.call(null,Jk),new X(null,2,5,Y,[a,Lf],null)):null}function Lk(a,b,c){var d=a[Hk];u(d)||(d=Jd.d(Ik,fc),a[Hk]=d);Jd.m(Jk,Wd,new X(null,2,5,Y,[d,b],null),c)};var Mk=W.c?W.c(Be):W.call(null,Be);u(Ci)&&document.addEventListener("DOMContentLoaded",function(){var a=document.createElement("div");a.id="chessground-moving-square";return document.body.appendChild(a)});var Nk=scrollX,Ok=scrollY,Pk=new s(null,2,[ih,u(Nk)?Nk:document.documentElement.scrollLeft,Jf,u(Ok)?Ok:document.documentElement.scrollTop],null),Qk=u((new RegExp("ipad|iphone|ipod".source,"i")).test(navigator.userAgent))?new s(null,2,[ih,0,Jf,0],null):Pk;
function Rk(a){var b=a.getBoundingClientRect();return new s(null,6,[Ah,b.left+ih.c(Qk),bh,b.right+ih.c(Qk),gg,b.top+Jf.c(Qk),dg,b.bottom+Jf.c(Qk),pg,function(){var a=b.width;return u(a)?a:b.right-b.left}(),wh,function(){var a=b.height;return u(a)?a:b.bottom-b.top}()],null)}function Sk(a){var b=a.target,c=function(){var a=b.x;return u(a)?a:0}()+a.dx;a=function(){var a=b.y;return u(a)?a:0}()+a.dy;var d="translate3d("+y.c(c)+"px, "+y.c(a)+"px, 0)";b.x=c;b.y=a;return b.style[Di]=d}
function Tk(a,b){var c=a.target,d=c.parentNode,e=a.dropzone,f=document.getElementById("chessground-moving-square");u(f)&&(f.style.display="none");u(e)&&e.classList.remove("drag-over");c.classList.remove("dragging");window.setTimeout(function(a){return function(){a.x=0;a.y=0;return a.style[Di]=""}}(c,d,e),20);c=Ei(d);return u(c)?u(u(e)?C.d(d.parentNode.parentNode,e.parentNode.parentNode):e)?vi.d(b,new X(null,2,5,Y,[Zg,Kd.d(Ei,new X(null,2,5,Y,[d,e],null))],null)):vi.d(b,new X(null,2,5,Y,[gh,c],null)):
null}function Uk(a,b,c){Lk(a,Lf,interact(a).draggable(!0).on("dragstart",function(a){var e=a.target,f=Ei(e);if(u(f)){e.classList.add("dragging");if(u(c)){var g,k=e.getBoundingClientRect();g=new s(null,2,[gg,k.top+document.body.scrollTop,Ah,k.left+document.body.scrollLeft],null);k=Ah.c(g)+e.offsetWidth/2;g=gg.c(g)+e.offsetHeight/2;g=a.pageY-g;e.x=a.pageX-k;e.y=g}a=vi.d(b,new X(null,2,5,Y,[Vg,f],null))}else a=null;return a}).on("dragmove",Sk).on("dragend",function(a){return Tk(a,b)}))}
function Vk(a){return Kk(a).set({draggable:!0})}function Wk(a){return Kk(a).set({draggable:!1})}
function Xk(a,b,c){var d=Zf.c(oh.c(c)),e="."+y.c("cg-piece");a=(u(a)?a:document).querySelectorAll(e);for(var e=E(a),f=null,g=0,k=0;;)if(k<g){a=f.L(null,k);var l=Kk(a),m=u(zi(a,"white"))?"white":"black",m=C.d(d,"both")||C.d(d,m);u(l)?(m?Vk:Wk).call(null,a,c):m&&Uk(a,b,rh.c(oh.c(c)));k+=1}else if(a=E(e))e=a,Kc(e)?(f=Gb(e),e=Hb(e),a=f,g=O(f),f=a):(a=F(e),f=Kk(a),g=u(zi(a,"white"))?"white":"black",g=C.d(d,"both")||C.d(d,g),u(f)?(g?Vk:Wk).call(null,a,c):g&&Uk(a,b,rh.c(oh.c(c))),e=K(e),f=null,g=0),k=0;
else return null}function Yk(a){return a.target.classList.add("drag-over")}function Zk(a){return a.target.classList.remove("drag-over")}
function $k(a){var b=Rk(a.target),c=wh.c(b)-1,d=pg.c(b)-1,e=2*c,f=2*d;a=document.getElementById("chessground-moving-square");null==If.c(a.offsetParent)&&(a.style.height=""+y.c(e)+"px",a.style.width=""+y.c(f)+"px",a.style.left=""+y.c(Ah.c(b)-d/2)+"px",a.style.top=""+y.c(gg.c(b)-c/2)+"px",a.style.display="block",Hd.d?Hd.d(Mk,b):Hd.call(null,Mk,b));d=M.c?M.c(Mk):M.call(null,Mk);c=Ah.c(b)-Ah.c(d);b=gg.c(b)-gg.c(d);return a.style[Di]="translate3d("+y.c(c)+"px, "+y.c(b)+"px, 0)"}
function al(){return null};var bl=function(){function a(a,d){var e=null;1<arguments.length&&(e=L(Array.prototype.slice.call(arguments,1),0));return b.call(this,a,e)}function b(a,b){return u(a)?T.d(a,Kd.d(Df,b)):null}a.r=1;a.k=function(a){var d=F(a);a=G(a);return b(d,a)};a.g=b;return a}();function cl(a,b){return Xd.v(a,new X(null,1,5,Y,[fg],null),Xi,b,eh.c(oh.c(a)))}
function dl(a,b){var c=Q.e(b,0,null),d=Q.e(b,1,null),e=u(fj(a,c,d))?function(){var b=bj(fg.c(a),new X(null,2,5,Y,[c,d],null));if(u(b)){var e=Wd(S.e(a,fg,b),new X(null,2,5,Y,[oh,eh],null),null);bl.g(Kg.c(og.c(oh.c(e))),L([c,d,b],0));return e}return null}():null;return u(e)?e:C.d(c,d)?S.e(a,xg,!1):u(function(){var b=na(xg.c(a));return b?ej(a,d):b}())?cl(a,d):S.e(Xd.e(a,new X(null,1,5,Y,[fg],null),Zi),xg,!1)}
function el(a,b){var c=ti.c(1);Yh(function(c){return function(){var e=function(){return function(a){return function(){function b(c){for(;;){var d;a:{try{for(;;){var e=a(c);if(!cd(e,Z)){d=e;break a}}}catch(f){if(f instanceof Object){c[5]=f;pi(c);d=Z;break a}throw f;}d=void 0}if(!cd(d,Z))return d}}function c(){var a=[null,null,null,null,null,null,null,null,null,null,null];a[0]=d;a[1]=1;return a}var d=null,d=function(a){switch(arguments.length){case 0:return c.call(this);case 1:return b.call(this,a)}throw Error("Invalid arity: "+
arguments.length);};d.n=c;d.c=b;return d}()}(function(c){return function(d){var e=d[1];if(9===e){var f=d[7],n=d[8],p=d[9],r=Ck.d(a,function(){return function(a){return function(b){return dl(b,a)}}(p,f,n,f,n,p,e,c)}());d[2]=r;d[1]=5;return Z}if(8===e)return f=d[7],n=d[8],p=d[9],r=Ck.d(a,function(){return function(a){return function(b){return Xd.e(C.d("trash",gh.c(oh.c(b)))?Xd.m(b,new X(null,1,5,Y,[fg],null),Ti,new Ee([a,null])):b,new X(null,1,5,Y,[fg],null),Zi)}}(p,f,n,f,n,p,e,c)}()),d[2]=r,d[1]=5,
Z;if(7===e)return f=d[7],n=d[8],p=d[9],r=Ck.d(a,function(){return function(a){return function(b){return Xd.v(S.e(b,xg,!0),new X(null,1,5,Y,[fg],null),Xi,a,eh.c(oh.c(b)))}}(p,f,n,f,n,p,e,c)}()),d[2]=r,d[1]=5,Z;if(6===e)return f=d[7],n=d[8],p=d[9],r=Ck.d(a,function(){return function(a){return function(b){var c;c=Ui(fg.c(b));c=u(c)?C.d(c,a)?null:dl(b,new X(null,2,5,Y,[c,a],null)):u(ej(b,a))?cl(b,a):null;return u(c)?c:b}}(p,f,n,f,n,p,e,c)}()),d[2]=r,d[1]=5,Z;if(5===e)return d[10]=d[2],d[2]=null,d[1]=
2,Z;if(4===e){var f=d[7],n=d[8],t=d[2],r=Q.e(t,0,null),p=Q.e(t,1,null);d[7]=r;d[8]=t;d[9]=p;switch(r instanceof V?r.ra:null){case "move-piece":d[1]=9;break;case "drop-off":d[1]=8;break;case "drag-start":d[1]=7;break;case "select-square":d[1]=6;break;default:throw Error("No matching clause: "+y.c(r));}return Z}return 3===e?(r=d[2],oi(d,r)):2===e?mi(d,4,b):1===e?(d[2]=null,d[1]=2,Z):null}}(c),c)}(),f=function(){var a=e.n?e.n():e.call(null);a[6]=c;return a}();return li(f)}}(c));return c};function fl(a,b){for(var c=E(new X(null,2,5,Y,["touchstart","mousedown"],null)),d=null,e=0,f=0;;)if(f<e){var g=d.L(null,f);a.addEventListener(g,function(){return function(a){a.preventDefault();return vi.d(b,new X(null,2,5,Y,[Pg,Ei(a.target)],null))}}(c,d,e,f,g));f+=1}else{var k=E(c);if(k){var l=k;Kc(l)?(c=Gb(l),e=Hb(l),d=c,l=O(c),c=e,e=l):(g=F(l),a.addEventListener(g,function(){return function(a){a.preventDefault();return vi.d(b,new X(null,2,5,Y,[Pg,Ei(a.target)],null))}}(c,d,e,f,g,l,k)),c=K(l),d=
null,e=0);f=0}else break}};var gl,hl,jl=function il(b,c){"undefined"===typeof gl&&(gl=function(b,c,f,g){this.oa=b;this.Ta=c;this.fd=f;this.Ic=g;this.t=0;this.j=393216},gl.Ya=!0,gl.Xa="chessground.ui/t10477",gl.ib=function(b,c){return B(c,"chessground.ui/t10477")},gl.prototype.Hb=!0,gl.prototype.Ib=function(){var b=this;return React.DOM.div({"data-key":bg.c(b.Ta),className:Bh(new X(null,5,5,Y,["cg-square",u(qh.c(b.Ta))?"selected":null,u(vh.c(b.Ta))?"check":null,u(hg.c(b.Ta))?"last-move":null,u(Mg.c(b.Ta))?"dest":null],null))},
function(){var c=lg.c(b.Ta);return u(c)?React.DOM.div({className:Bh(new X(null,3,5,Y,["cg-piece",Zf.c(c),Kf.c(c)],null))}):null}())},gl.prototype.Zb=!0,gl.prototype.Gb=function(){var b=Ek.c(this.oa),c=kk.d(this.oa,Lg);fl(b,c);return interact(b).dropzone(!0).on("dragenter",u(Ci)?$k:Yk).on("dragleave",u(Ci)?al:Zk)},gl.prototype.G=function(){return this.Ic},gl.prototype.I=function(b,c){return new gl(this.oa,this.Ta,this.fd,c)});return new gl(c,b,il,null)},ll=function kl(b,c){"undefined"===typeof hl&&
(hl=function(b,c,f,g){this.oa=b;this.Ia=c;this.nc=f;this.Jc=g;this.t=0;this.j=393216},hl.Ya=!0,hl.Xa="chessground.ui/t10497",hl.ib=function(b,c){return B(c,"chessground.ui/t10497")},hl.prototype.Hb=!0,hl.prototype.Ib=function(){var b=this,c=this,f=C.d(sg.c(b.Ia),"white");return T.e(hj,{className:"cg-board"},function(){return function(c,e){return function m(f){return new fd(null,function(c,e){return function(){for(var g=f;;){var k=E(g);if(k){var z=k,H=F(z);if(k=E(function(c,e,f,g,k,m){return function ea(n){return new fd(null,
function(c,e,f,g,k){return function(){for(;;){var c=E(n);if(c){if(Kc(c)){var f=Gb(c),g=O(f),m=kd(g);return function(){for(var c=0;;)if(c<g){var n=A.d(f,c),p=R.d("abcdefgh",n-1),r=""+y.c(p)+y.c(e),t=new Ee([k?"left":"right",""+y.c(12.5*(n-1))+"%",k?"bottom":"top",""+y.c(12.5*(e-1))+"%"]),v=C.d(e,k?1:8)?p:null,z=C.d(n,k?8:1)?e:null;od(m,React.DOM.div(Df(function(){var b=new s(null,1,[Eg,t],null),b=u(v)?cf.g(L([b,new s(null,1,[dh,v],null)],0)):b;return u(z)?cf.g(L([b,new s(null,1,[Sf,z],null)],0)):b}()),
zk.e(jl,Ud.d(b.Ia,new X(null,2,5,Y,[fg,r],null)),new s(null,1,[Xf,r],null))));c+=1}else return!0}()?nd(m.M(),ea(Hb(c))):nd(m.M(),null)}var p=F(c),r=R.d("abcdefgh",p-1),t=""+y.c(r)+y.c(e),v=new Ee([k?"left":"right",""+y.c(12.5*(p-1))+"%",k?"bottom":"top",""+y.c(12.5*(e-1))+"%"]),z=C.d(e,k?1:8)?r:null,H=C.d(p,k?8:1)?e:null;return N(React.DOM.div(Df(function(){var b=new s(null,1,[Eg,v],null),b=u(z)?cf.g(L([b,new s(null,1,[dh,z],null)],0)):b;return u(H)?cf.g(L([b,new s(null,1,[Sf,H],null)],0)):b}()),
zk.e(jl,Ud.d(b.Ia,new X(null,2,5,Y,[fg,t],null)),new s(null,1,[Xf,t],null))),ea(G(c)))}return null}}}(c,e,f,g,k,m),null,null)}}(g,H,z,k,c,e)(mf.d(1,9))))return td.d(k,m(G(g)));g=G(g)}else return null}}}(c,e),null,null)}}(f,c)(mf.d(1,9))}())},hl.prototype.Qc=!0,hl.prototype.$b=function(){return Xk(Ek.c(this.oa),kk.d(this.oa,Lg),this.Ia)},hl.prototype.Zb=!0,hl.prototype.Gb=function(){return Xk(Ek.c(this.oa),kk.d(this.oa,Lg),this.Ia)},hl.prototype.$c=!0,hl.prototype.mc=function(){Gk(this.Ia,kk.d(this.oa,
Gg));return el(this.Ia,kk.d(this.oa,Lg))},hl.prototype.G=function(){return this.Jc},hl.prototype.I=function(b,c){return new hl(this.oa,this.Ia,this.nc,c)});return new hl(c,b,kl,null)};NodeList.prototype.Bc=!0;NodeList.prototype.N=function(){return L.d(this,0)};function ml(a,b){var c=ti.n();Bk(ll,W.c?W.c(dj(function(){var a=If.g(b,L([new s(null,1,[Hf,!0],null)],0));return u(a)?a:Be}())):W.call(null,dj(function(){var a=If.g(b,L([new s(null,1,[Hf,!0],null)],0));return u(a)?a:Be}())),new s(null,2,[lh,a,$g,new s(null,2,[Gg,c,Lg,ti.n()],null)],null));return Fk(c)}var nl=["chessground","main"],ol=this;nl[0]in ol||!ol.execScript||ol.execScript("var "+nl[0]);
for(var pl;nl.length&&(pl=nl.shift());)nl.length||void 0===ml?ol=ol[pl]?ol[pl]:ol[pl]={}:ol[pl]=ml;;return this.chessground;}.call({});});
