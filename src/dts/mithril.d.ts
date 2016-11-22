// Type definitions for mithril.js 1.0
// Project: https://github.com/lhorie/mithril.js
// Definitions by: Mike Linkovich <https://github.com/spacejack>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

// Typescript 2.0

declare namespace Mithril {

  interface Lifecycle<A,S> {
    oninit?: (this: S, vnode: Vnode<A,S>) => void;
    oncreate?: (this: S, vnode: Vnode<A,S>) => void;
    onbeforeremove?: (this: S, vnode: Vnode<A,S>, done: () => void) => void;
    onremove?: (this: S, vnode: Vnode<A,S>) => void;
    onbeforeupdate?: (this: S, vnode: Vnode<A,S>, old: Vnode<A,S>) => boolean;
    onupdate?: (this: S, vnode: Vnode<A,S>) => void;
  }

  interface Hyperscript {
    (selector: string, ...children: any[]): Vnode<any,any>;
    <A>(component: Component<A,any>, a?: (A & Lifecycle<A,any>) | Children, ...children: Children[]): Vnode<any,any>;
    fragment(attrs: any, children: any[]): Vnode<any,any>;
    trust(html: string): Vnode<any,any>;
  }

  interface RouteResolver {
    render?: (vnode: Mithril.Vnode<any,any>) => Mithril.Vnode<any,any>;
    onmatch?: (resolve: (c: Component<any,any>) => void, args: any, path?: string) => void;
  }

  interface RouteDefs {
    [url: string]: Component<any,any> | RouteResolver;
  }

  interface RouteOptions {
    replace?: boolean;
  }

  interface Route {
    (element: HTMLElement, defaultRoute: string, routes: RouteDefs): void;
    get(): string;
    set(route: string, data?: any, options?: RouteOptions): void;
    prefix(urlFragment: string): void;
    link(vnode: Vnode<any,any>): (e: Event) => void;
  }

  interface Mount {
    (element: Element, component: Component<any,any>): void;
  }

  interface WithAttr {
    <T>(name: string, stream: Stream<T>, thisArg?: any): (e: {currentTarget: any, [p: string]: any}) => boolean;
    (name: string, callback: (value: any) => boolean, thisArg?: any): (e: {currentTarget: any, [p: string]: any}) => boolean;
  }

  interface ParseQueryString {
    (queryString: string): any;
  }

  interface BuildQueryString {
    (values: {[p: string]: any}): string;
  }

  type Unary<T,U> = (input: T) => U;

  interface Functor<T> {
    map<U>(f: Unary<T,U>): Functor<U>;
    ap?(f: Functor<T>): Functor<T>;
  }

  interface Stream<T> {
    (): T;
    (value: T): this;
    map(f: (current: T) => Stream<T> | T | void): Stream<T>;
    map<U>(f: (current: T) => Stream<U> | U): Stream<U>;
    of(val?: T): Stream<T>;
    ap<U>(f: Stream<(value: T) => U>): Stream<U>;
    end: Stream<boolean>;
  }

  type StreamCombiner<T> = (...streams: Stream<any>[]) => T

  interface StreamFactory {
    <T>(val?: T): Stream<T>;
    combine<T>(combiner: StreamCombiner<T>, streams: Stream<any>[]): Stream<T>;
    reject<T>(value: T): Stream<T>;
    merge(streams: Stream<any>[]): Stream<any[]>;
    HALT: any;
  }

  interface Request {
    <T>(options: RequestOptions<T>): Promise<T>;
  }

  interface RequestService {
    request: Request;
    jsonp: Jsonp;
  }

  interface Render {
    (el: Element, vnodes: Vnode<any,any> | Vnode<any,any>[]): void;
  }

  interface RenderService {
    render: Render;
  }

  interface Publish {
    (): void;
  }

  interface RedrawService {
    redraw: Publish;
  }

  interface Jsonp {
    <T>(options: JsonpOptions<T>): Promise<T>;
  }

  interface Static extends Hyperscript {
    route: Route;
    mount: Mount;
    withAttr: WithAttr;
    render: Render;
    redraw: Publish;
    request: Request;
    jsonp: Jsonp;
    parseQueryString: ParseQueryString;
    buildQueryString: BuildQueryString;
    version: string;
  }

  // Vnode children types
  type ChildNode = Vnode<any, any>;
  type Child = string | number | boolean | ChildNode;
  interface ChildArray extends Array<Children> {}
  type Children = Child | ChildArray;

  /** Mithril Vnode type */
  interface Vnode<A, S extends Lifecycle<A,S>> {
    tag: string | Component<A,S>;
    attrs: A;
    state: S;
    key?: string;
    children?: Vnode<any,any>[];
    dom?: Element;
    domSize?: number;
    events?: any;
  }

  interface VnodeFactory {
    <A,S>(tag: string | Component<A,S>, key: string | number, attrs: A, children: Array<ChildNode>, text: string, dom: Element): ChildNode
  }

  /** Component with typed vnode state & attrs */
  interface Component<A, S extends Lifecycle<A,S>> extends Lifecycle<A,S> {
    view: (this: S, vnode: Vnode<A,S>) => Vnode<any,any> | null | void | (Vnode<any,any> | null | void)[];
  }

  interface RequestOptions<T> {
    url: string;
    method?: string;
    data?: any;
    async?: boolean;
    user?: string;
    password?: string;
    config?: any;
    type?: any;
    serialize?: (data: T) => string;
    deserialze?: (str: string) => T;
    extract?: (xhr: XMLHttpRequest, options: RequestOptions<T>) => string;
    useBody?: boolean;
  }

  interface JsonpOptions<T> {
    url: string;
    data?: any;
    type?: new <U>(data: U) => T;
    callbackName?: string;
    callbackKey?: string;
  }
}

declare module 'mithril' {
  const m: Mithril.Static;
  export = m;
}

declare module 'mithril/hyperscript' {
  const h: Mithril.Hyperscript;
  export = h;
}

declare module 'mithril/util/withAttr' {
  const withAttr: Mithril.WithAttr;
  export = withAttr;
}

declare module 'mithril/render/vnode' {
  const vnode: Mithril.VnodeFactory;
  export = vnode;
}

declare module 'mithril/stream' {
  const s: Mithril.StreamFactory;
  export = s;
}
