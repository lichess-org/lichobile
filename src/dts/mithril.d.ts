/* eslint-disable */
declare namespace Mithril {

	interface Lifecycle<Attrs, State> {
		/** The oninit hook is called before a vnode is touched by the virtual DOM engine. */
		oninit?(this: State, vnode: Vnode<Attrs, State>): any;
		/** The oncreate hook is called after a DOM element is created and attached to the document. */
		oncreate?(this: State, vnode: VnodeDOM<Attrs, State>): any;
		/** The onbeforeremove hook is called before a DOM element is detached from the document. If a Promise is returned, Mithril only detaches the DOM element after the promise completes. */
		onbeforeremove?(this: State, vnode: VnodeDOM<Attrs, State>): Promise<any> | void;
		/** The onremove hook is called before a DOM element is removed from the document. */
		onremove?(this: State, vnode: VnodeDOM<Attrs, State>): any;
		/** The onbeforeupdate hook is called before a vnode is diffed in a update. */
		onbeforeupdate?(this: State, vnode: Vnode<Attrs, State>, old: VnodeDOM<Attrs, State>): boolean | void;
		/** The onupdate hook is called after a DOM element is updated, while attached to the document. */
		onupdate?(this: State, vnode: VnodeDOM<Attrs, State>): any;
		/** WORKAROUND: TypeScript 2.4 does not allow extending an interface with all-optional properties. */
		[_: number]: any;
	}

	interface Hyperscript {
		/** Creates a virtual element (Vnode). */
		(selector: string, ...children: Children[]): Vnode<any, any>;
		/** Creates a virtual element (Vnode). */
		(selector: string, attributes: Attributes, ...children: Children[]): Vnode<any, any>;
		/** Creates a virtual element (Vnode). */
		<Attrs, State>(component: ComponentTypes<Attrs, State>, ...args: Children[]): Vnode<Attrs, State>;
		/** Creates a virtual element (Vnode). */
		<Attrs, State>(component: ComponentTypes<Attrs, State>, attributes: Attrs & Lifecycle<Attrs, State> & { key?: string | number }, ...args: Children[]): Vnode<Attrs, State>;
		/** Creates a fragment virtual element (Vnode). */
		fragment(attrs: Lifecycle<any, any> & { [key: string]: any }, children: ChildArrayOrPrimitive): Vnode<any, any>;
		/** Turns an HTML string into a virtual element (Vnode). Do not use trust on unsanitized user input. */
		trust(html: string): Vnode<any, any>;
	}

	// Vnode children types
  type VnodeAny = Vnode<any, any>
	type Child = Vnode<any, any> | string | number | boolean | null | undefined;
	interface ChildArray extends Array<Children> { }
	type Children = Child | ChildArray;
	type ChildArrayOrPrimitive = ChildArray | string | number | boolean;

	/** Virtual DOM nodes, or vnodes, are Javascript objects that represent an element (or parts of the DOM). */
	interface Vnode<Attrs = {}, State extends Lifecycle<Attrs, State> = {}> {
		/** The nodeName of a DOM element. It may also be the string [ if a vnode is a fragment, # if it's a text vnode, or < if it's a trusted HTML vnode. Additionally, it may be a component. */
		tag: string | ComponentTypes<Attrs, State>;
		/** A hashmap of DOM attributes, events, properties and lifecycle methods. */
		attrs: Attrs;
		/** An object that is persisted between redraws. In component vnodes, state is a shallow clone of the component object. */
		state: State;
		/** The value used to map a DOM element to its respective item in an array of data. */
		key?: string | number;
		/** In most vnode types, the children property is an array of vnodes. For text and trusted HTML vnodes, The children property is either a string, a number or a boolean. */
		children?: ChildArrayOrPrimitive;
		/**
		 * This is used instead of children if a vnode contains a text node as its only child.
		 * This is done for performance reasons.
		 * Component vnodes never use the text property even if they have a text node as their only child.
		 */
		text?: string | number | boolean;
	}

	// In some lifecycle methods, Vnode will have a dom property
	// and possibly a domSize property.
	interface VnodeDOM<Attrs = {}, State extends Lifecycle<Attrs, State> = {}> extends Vnode<Attrs, State> {
		/** Points to the element that corresponds to the vnode. */
		dom: HTMLElement | SVGElement
		/** This defines the number of DOM elements that the vnode represents (starting from the element referenced by the dom property). */
		domSize?: number;
	}

  type VnodeDOMAny = VnodeDOM<any, any>

	type CVnode<A = {}> = Vnode<A, ClassComponent<A>>

	type CVnodeDOM<A = {}> = VnodeDOM<A, ClassComponent<A>>

	/**
	 * Components are a mechanism to encapsulate parts of a view to make code easier to organize and/or reuse.
	 * Any Javascript object that has a view method can be used as a Mithril component.
	 * Components can be consumed via the m() utility.
	 */
	interface Component<Attrs = {}, State extends Lifecycle<Attrs, State> = {}> extends Lifecycle<Attrs, State> {
		/** Creates a view out of virtual elements. */
		view(this: State, vnode: Vnode<Attrs, State>): Children | null | void;
	}

	/**
	 * Components are a mechanism to encapsulate parts of a view to make code easier to organize and/or reuse.
	 * Any class that implements a view method can be used as a Mithril component.
	 * Components can be consumed via the m() utility.
	 */
	interface ClassComponent<A = {}> extends Lifecycle<A, ClassComponent<A>> {
		/** The oninit hook is called before a vnode is touched by the virtual DOM engine. */
		oninit?(vnode: Vnode<A, this>): any;
		/** The oncreate hook is called after a DOM element is created and attached to the document. */
		oncreate?(vnode: VnodeDOM<A, this>): any;
		/** The onbeforeremove hook is called before a DOM element is detached from the document. If a Promise is returned, Mithril only detaches the DOM element after the promise completes. */
		onbeforeremove?(vnode: VnodeDOM<A, this>): Promise<any> | void;
		/** The onremove hook is called before a DOM element is removed from the document. */
		onremove?(vnode: VnodeDOM<A, this>): any;
		/** The onbeforeupdate hook is called before a vnode is diffed in a update. */
		onbeforeupdate?(vnode: Vnode<A, this>, old: VnodeDOM<A, this>): boolean | void;
		/** The onupdate hook is called after a DOM element is updated, while attached to the document. */
		onupdate?(vnode: VnodeDOM<A, this>): any;
		/** Creates a view out of virtual elements. */
		view(vnode: Vnode<A, this>): Children | null | void;
	}

	/**
	 * Components are a mechanism to encapsulate parts of a view to make code easier to organize and/or reuse.
	 * Any function that returns an object with a view method can be used as a Mithril component.
	 * Components can be consumed via the m() utility.
	 */
	type FactoryComponent<A = {}> = (vnode: Vnode<A>) => Component<A>;

	/**
	 * Components are a mechanism to encapsulate parts of a view to make code easier to organize and/or reuse.
	 * Any function that returns an object with a view method can be used as a Mithril component.
	 * Components can be consumed via the m() utility.
	 */
	type ClosureComponent<A = {}> = FactoryComponent<A>;

	/**
	 * Components are a mechanism to encapsulate parts of a view to make code easier to organize and/or reuse.
	 * Any Javascript object that has a view method is a Mithril component. Components can be consumed via the m() utility.
	 */
	type Comp<Attrs = {}, State extends Lifecycle<Attrs, State> = {}> = Component<Attrs, State> & State;

	/** Components are a mechanism to encapsulate parts of a view to make code easier to organize and/or reuse. Components can be consumed via the m() utility. */
	type ComponentTypes<A = {}, S extends Lifecycle<A, S> = {}> = Component<A, S> | { new (vnode: CVnode<A>): ClassComponent<A> } | FactoryComponent<A>;

	/** This represents the attributes available for configuring virtual elements, beyond the applicable DOM attributes. */
	interface Attributes extends Lifecycle<any, any> {
		/** The class name(s) for this virtual element, as a space-separated list. */
		className?: string;
		/** The class name(s) for this virtual element, as a space-separated list. */
		class?: string;
		/** A key to optionally associate with this element. */
		key?: string | number;
		/** Any other virtual element properties, including attributes and event handlers. */
		[property: string]: any;
	}
}

declare module 'mithril/hyperscript' {
  const h: Mithril.Hyperscript
  export = h
}

declare module 'mithril/render' {
  function render(el: Element, vnodes: Mithril.Children): void
  export = render
}

declare module 'mithril/render/vnode' {
  function Vnode(tag: string | Mithril.Component, key?: string, attrs?: Object): Mithril.Vnode<any, any>
  export = Vnode
}
