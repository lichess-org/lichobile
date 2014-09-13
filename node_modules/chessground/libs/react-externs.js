/**
 * @fileoverview Closure Compiler externs for Facebook React.js 0.11.0.
 * @see http://reactjs.org
 * @externs
 */

/**
 * @type {Object}
 * @const
 */
var React = {};

/**
 * @type {string}
 */
React.version;

/**
 * @param {boolean} shouldUseTouch
 */
React.initializeTouchEvents = function(shouldUseTouch) {};

/**
 * @param {Object} specification
 * @return {function(
 *   Object=,
 *   ...[React.ChildrenArgument]
 * ): React.ReactComponent}
 */
React.createClass = function(specification) {};

/**
 * @param {*} componentClass
 * @return {boolean}
 */
React.isValidClass = function(componentClass) {};

/**
 * @param {React.ReactComponent} container
 * @param {Element} mountPoint
 * @param {Function=} callback
 * @return {React.ReactComponent}
 */
React.renderComponent = function(container, mountPoint, callback) {};

/**
 * @param {Element} container
 */
React.unmountComponentAtNode = function(container) {};

/**
 * @param {React.ReactComponent} component
 * @return {string}
 */
React.renderComponentToString = function(component) {};

/**
 * @param {React.ReactComponent} component
 * @return {string}
 */
React.renderComponentToStaticMarkup = function(component) {};

/**
 * Constructs a component instance of `constructor` with `initialProps` and
 * renders it into the supplied `container`.
 *
 * @param {Function} constructor React component constructor.
 * @param {Object} props Initial props of the component instance.
 * @param {Element} container DOM element to render into.
 * @return {React.ReactComponent} Component instance rendered in `container`.
 */
React.constructAndRenderComponent = function(constructor, props, container) {};

/**
 * Constructs a component instance of `constructor` with `initialProps` and
 * renders it into a container node identified by supplied `id`.
 *
 * @param {Function} componentConstructor React component constructor
 * @param {Object} props Initial props of the component instance.
 * @param {string} id ID of the DOM element to render into.
 * @return {React.ReactComponent} Component instance rendered in the container node.
 */
React.constructAndRenderComponentByID = function(componentConstructor, props, id) {};

/**
 * @interface
 */
React.ReactComponent = function() {};

/**
 * @type {Object}
 */
React.ReactComponent.prototype.props;

/**
 * @type {Object}
 */
React.ReactComponent.prototype.state;

/**
 * @type {Object}
 */
React.ReactComponent.prototype.refs;

/**
 * @type {Object}
 */
React.ReactComponent.prototype.context;

/**
 * @type {Object}
 * @protected
 */
React.ReactComponent.prototype.propTypes;

/**
 * @type {Object}
 * @protected
 */
React.ReactComponent.prototype.contextTypes;

/**
 * @param {Object} nextProps
 * @param {Function=} callback
 */
React.ReactComponent.prototype.setProps = function(nextProps, callback) {};

/**
 * @return {Object}
 */
React.ReactComponent.prototype.getInitialState = function() {};

/**
 * @return {Object}
 */
React.ReactComponent.prototype.getDefaultProps = function() {};

/**
 * @return {Object}
 */
React.ReactComponent.prototype.getChildContext = function() {};

/**
 * @return {Element}
 */
React.ReactComponent.prototype.getDOMNode = function() {};

/**
 * @param {Object} nextProps
 * @param {Function=} callback
 */
React.ReactComponent.prototype.replaceProps = function(nextProps, callback) {};

/**
 * @param {React.ReactComponent} targetComponent
 * @return {React.ReactComponent}
 */
React.ReactComponent.prototype.transferPropsTo = function(targetComponent) {};

/**
 * @param {Function=} callback
 */
React.ReactComponent.prototype.forceUpdate = function(callback) {};

/**
 * @return {boolean}
 */
React.ReactComponent.prototype.isMounted = function(callback) {};

/**
 * @param {Object} nextState
 * @param {Function=} callback
 */
React.ReactComponent.prototype.setState = function(nextState, callback) {};

/**
 * @param {Object} nextState
 * @param {Function=} callback
 */
React.ReactComponent.prototype.replaceState = function(nextState, callback) {};

/**
 * @protected
 */
React.ReactComponent.prototype.componentWillMount = function() {};

/**
 * @param {Element} element
 * @protected
 */
React.ReactComponent.prototype.componentDidMount = function(element) {};

/**
 * @param {Object} nextProps
 * @protected
 */
React.ReactComponent.prototype.componentWillReceiveProps = function(
  nextProps) {};

/**
 * @param {Object} nextProps
 * @param {Object} nextState
 * @return {boolean}
 * @protected
 */
React.ReactComponent.prototype.shouldComponentUpdate = function(
  nextProps, nextState) {};

/**
 * @param {Object} nextProps
 * @param {Object} nextState
 * @protected
 */
React.ReactComponent.prototype.componentWillUpdate = function(
  nextProps, nextState) {};

/**
 * @param {Object} prevProps
 * @param {Object} prevState
 * @param {Element} rootNode
 * @protected
 */
React.ReactComponent.prototype.componentDidUpdate = function(
  prevProps, prevState, rootNode) {};

/**
 * @protected
 */
React.ReactComponent.prototype.componentWillUnmount = function() {};

/**
 * @return {React.ReactComponent}
 * @protected
 */
React.ReactComponent.prototype.render = function() {};

/**
 * Interface to preserve React attributes for advanced compilation.
 * @interface
 */
React.ReactAtrribute = function() {};

/**
 * @type {Object}
 */
React.ReactAtrribute.dangerouslySetInnerHTML;

/**
 * @type {string}
 */
React.ReactAtrribute.__html;

/**
 * @type {string}
 */
React.ReactAtrribute.key;

/**
 * @type {string}
 */
React.ReactAtrribute.ref;

// Attributes not defined in default Closure Compiler DOM externs.
// http://facebook.github.io/react/docs/tags-and-attributes.html#html-attributes
// It happens because React favors camelCasing over allinlowercase.
// How to update list:
//   1) Open http://facebook.github.io/react/docs/tags-and-attributes.html#html-attributes
//   2) Github Search in google/closure-compiler for attribute.

/**
 * @type {boolean}
 */
React.ReactAtrribute.allowFullScreen;

/**
 * @type {boolean}
 */
React.ReactAtrribute.autoComplete;

/**
 * @type {boolean}
 */
React.ReactAtrribute.autoFocus;

/**
 * @type {boolean}
 */
React.ReactAtrribute.autoPlay;

/**
 * @type {boolean}
 */
React.ReactAtrribute.noValidate;

/**
 * @type {boolean}
 */
React.ReactAtrribute.spellCheck;


// http://facebook.github.io/react/docs/events.html

/**
 * @type {Function}
 */
React.ReactAtrribute.onCopy;

/**
 * @type {Function}
 */
React.ReactAtrribute.onCut;

/**
 * @type {Function}
 */
React.ReactAtrribute.onPaste;

/**
 * @type {Function}
 */
React.ReactAtrribute.onKeyDown;

/**
 * @type {Function}
 */
React.ReactAtrribute.onKeyPress;

/**
 * @type {Function}
 */
React.ReactAtrribute.onKeyUp;

/**
 * @type {Function}
 */
React.ReactAtrribute.onFocus;

/**
 * @type {Function}
 */
React.ReactAtrribute.onBlur;

/**
 * @type {Function}
 */
React.ReactAtrribute.onChange;

/**
 * @type {Function}
 */
React.ReactAtrribute.onInput;

/**
 * @type {Function}
 */
React.ReactAtrribute.onSubmit;

/**
 * @type {Function}
 */
React.ReactAtrribute.onClick;

/**
 * @type {Function}
 */
React.ReactAtrribute.onDoubleClick;

/**
 * @type {Function}
 */
React.ReactAtrribute.onDrag;

/**
 * @type {Function}
 */
React.ReactAtrribute.onDragEnd;

/**
 * @type {Function}
 */
React.ReactAtrribute.onDragEnter;

/**
 * @type {Function}
 */
React.ReactAtrribute.onDragExit;

/**
 * @type {Function}
 */
React.ReactAtrribute.onDragLeave;

/**
 * @type {Function}
 */
React.ReactAtrribute.onDragOver;

/**
 * @type {Function}
 */
React.ReactAtrribute.onDragStart;

/**
 * @type {Function}
 */
React.ReactAtrribute.onDrop;

/**
 * @type {Function}
 */
React.ReactAtrribute.onMouseDown;

/**
 * @type {Function}
 */
React.ReactAtrribute.onMouseEnter;

/**
 * @type {Function}
 */
React.ReactAtrribute.onMouseLeave;

/**
 * @type {Function}
 */
React.ReactAtrribute.onMouseMove;

/**
 * @type {Function}
 */
React.ReactAtrribute.onMouseUp;

/**
 * @type {Function}
 */
React.ReactAtrribute.onTouchCancel;

/**
 * @type {Function}
 */
React.ReactAtrribute.onTouchEnd;

/**
 * @type {Function}
 */
React.ReactAtrribute.onTouchMove;

/**
 * @type {Function}
 */
React.ReactAtrribute.onTouchStart;

/**
 * @type {Function}
 */
React.ReactAtrribute.onScroll;

/**
 * @type {Function}
 */
React.ReactAtrribute.onWheel;

/**
 * @type {Object}
 * @const
 */
React.DOM = {};

/**
 * @typedef {
 *   boolean|number|string|React.ReactComponent|
 *   Array.<boolean>|Array.<number>|Array.<string>|Array.<React.ReactComponent>
 * }
 */
React.ChildrenArgument;

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.a = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.abbr = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.address = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.area = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.article = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.aside = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.audio = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.b = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.base = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.bdi = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.bdo = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.big = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.blockquote = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.body = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.br = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.button = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.canvas = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.caption = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.cite = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.code = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.col = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.colgroup = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.data = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.datalist = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.dd = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.del = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.details = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.dfn = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.div = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.dl = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.dt = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.em = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.embed = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.fieldset = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.figcaption = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.figure = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.footer = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.form = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.h1 = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.h2 = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.h3 = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.h4 = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.h5 = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.h6 = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.head = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.header = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.hr = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.html = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.i = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.iframe = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.img = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.input = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.ins = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.kbd = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.keygen = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.label = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.legend = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.li = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.link = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.main = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.map = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.mark = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.menu = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.menuitem = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.meta = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.meter = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.nav = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.noscript = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.object = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.ol = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.optgroup = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.option = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.output = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.p = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.param = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.pre = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.progress = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.q = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.rp = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.rt = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.ruby = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.s = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.samp = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.script = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.section = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.select = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.small = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.source = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.span = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.strong = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.style = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.sub = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.table = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.tbody = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.td = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.textarea = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.tfood = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.th = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.thead = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.time = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.title = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.tr = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.track = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.u = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.ul = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.var = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.video = function(props, children) {};

/**
 * @param {Object=} props
 * @param {...React.ChildrenArgument} children
 * @return {React.ReactComponent}
 * @protected
 */
React.DOM.wbr = function(props, children) {};

/**
 * @typedef {function(boolean, boolean, Object, string, string, string): boolean} React.ChainableTypeChecker
 */
React.ChainableTypeChecker;

/**
 * @type {React.ChainableTypeChecker}
 */
React.ChainableTypeChecker.weak;

/**
 * @type {React.ChainableTypeChecker}
 */
React.ChainableTypeChecker.weak.isRequired;

/**
 * @type {React.ChainableTypeChecker}
 */
React.ChainableTypeChecker.isRequired;

/**
 * @type {React.ChainableTypeChecker}
 */
React.ChainableTypeChecker.isRequired.weak;

/**
 * @type {Object}
 */
React.PropTypes = {
  /** @type {React.ChainableTypeChecker} */
  any: function () {},
  /** @type {React.ChainableTypeChecker} */
  array: function () {},
  /** @type {React.ChainableTypeChecker} */
  arrayOf: function () {},
  /** @type {React.ChainableTypeChecker} */
  "boolean": function () {},
  /** @type {React.ChainableTypeChecker} */
  component: function () {},
  /** @type {React.ChainableTypeChecker} */
  func: function () {},
  /** @type {React.ChainableTypeChecker} */
  number: function () {},
  /** @type {React.ChainableTypeChecker} */
  object: function () {},
  /** @type {React.ChainableTypeChecker} */
  string: function () {},
  /** @type {React.ChainableTypeChecker} */
  oneOf: function () {},
  /** @type {React.ChainableTypeChecker} */
  oneOfType: function () {},
  /** @type {React.ChainableTypeChecker} */
  instanceOf: function () {},
  /** @type {React.ChainableTypeChecker} */
  renderable: function () {},
  /** @type {React.ChainableTypeChecker} */
  shape: function () {}
};

/**
 * @type {Object}
 */
React.Children;

/**
 * @param {Object} children Children tree container.
 * @param {function(*, number)} mapFunction
 * @param {*} mapContext Context for mapFunction.
 * @return {Object|undefined} Object containing the ordered map of results.
 */
React.Children.map;

/**
 * @param {Object} children Children tree container.
 * @param {function(*, number)} mapFunction
 * @param {*} mapContext Context for mapFunction.
 */
React.Children.forEach;

/**
 * @param {Object} children Children tree container.
 * @return {Object|undefined}
 */
React.Children.only;

/**
 * @type {Object}
 */
React.addons;

/**
 * @param {Object} object
 * @return {string}
 */
React.addons.classSet;
