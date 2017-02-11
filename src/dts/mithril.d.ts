// Type definitions for mithril.js 1.0
// Project: https://github.com/lhorie/mithril.js
// Definitions by: Mike Linkovich <https://github.com/spacejack>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

// Typescript 2

declare namespace Mithril {

  interface Lifecycle<A,S> {
    oninit?: (this: S, vnode: Vnode<A,S>) => void;
    oncreate?: (this: S, vnode: VnodeDOM<A,S>) => void;
    onbeforeremove?: (this: S, vnode: VnodeDOM<A,S>) => Promise<any> | void;
    onremove?: (this: S, vnode: VnodeDOM<A,S>) => void;
    onbeforeupdate?: (this: S, vnode: Vnode<A,S>, old: Vnode<A,S>) => boolean;
    onupdate?: (this: S, vnode: VnodeDOM<A,S>) => void;
  }

  interface Hyperscript {
    (selector: string, ...children: any[]): Vnode<any,any>;
    <A,S>(component: Component<A,S>, a?: (A & Lifecycle<A,S>) | Children, ...children: Children[]): Vnode<A,S>;
    fragment(attrs: any, children: any[]): Vnode<any,any>;
    trust(html: string): Vnode<any,any>;
  }

  interface RouteResolver {
    render?: (vnode: Mithril.Vnode<any,any>) => Mithril.Vnode<any,any>;
    onmatch?: (args: any, requestedPath: string) => any;
  }

  interface RouteDefs {
    [url: string]: Component<any,any> | RouteResolver;
  }

  interface RouteOptions {
    replace?: boolean;
    state?: any;
    title?: string;
  }

  interface Route {
    (element: HTMLElement, defaultRoute: string, routes: RouteDefs): void;
    get(): string;
    set(route: string, data?: any, options?: RouteOptions): void;
    prefix(urlFragment: string): void;
    link(vnode: Vnode<any,any>): (e: Event) => void;
    param(name?: string): any;
  }

  interface Mount {
    (element: Element, component: Component<any,any> | null): void;
  }

  interface WithAttr {
    <T>(name: string, stream: Stream<T>, thisArg?: any): (e: {currentTarget: any, [p: string]: any}) => boolean;
    (name: string, callback: (value: any) => void, thisArg?: any): (e: {currentTarget: any, [p: string]: any}) => boolean;
  }

  interface ParseQueryString {
    (queryString: string): any;
  }

  interface BuildQueryString {
    (values: {[p: string]: any}): string;
  }

  interface RequestOptions<T> {
    method?: string;
    data?: any;
    async?: boolean;
    user?: string;
    password?: string;
    withCredentials?: boolean;
    config?: (xhr: XMLHttpRequest) => void;
    headers?: any;
    type?: any;
    serialize?: (data: any) => string;
    deserialize?: (str: string) => T;
    extract?: (xhr: XMLHttpRequest, options: RequestOptions<T>) => string;
    useBody?: boolean;
    background?: boolean;
  }

  interface RequestOptionsAll<T> extends RequestOptions<T> {
    url: string;
  }

  interface Request {
    <T>(options: RequestOptionsAll<T>): Promise<T>;
    <T>(url: string, options?: RequestOptions<T>): Promise<T>;
  }

  interface JsonpOptions<T> {
    data?: any;
    type?: new <U>(data: U) => T;
    callbackName?: string;
    callbackKey?: string;
  }

  interface JsonpOptionsAll<T> extends JsonpOptions<T> {
    url: string;
  }

  interface Jsonp {
    <T>(options: JsonpOptionsAll<T>): Promise<T>;
    <T>(url: string, options?: JsonpOptions<T>): Promise<T>;
  }

  interface RequestService {
    request: Request;
    jsonp: Jsonp;
  }

  interface Render {
    (el: Element, vnodes: Vnode<any,any> | Vnode<any,any>[]): void;
  }

  interface RenderService {
    render: Render
  }

  interface Redraw {
    (): void;
  }

  interface RedrawService {
    redraw: Redraw
    render: Render
  }

  interface Static extends Hyperscript {
    route: Route;
    mount: Mount;
    withAttr: WithAttr;
    render: Render;
    redraw: Redraw;
    request: Request;
    jsonp: Jsonp;
    parseQueryString: ParseQueryString;
    buildQueryString: BuildQueryString;
    version: string;
  }

  // Vnode children types
  type DOMNode = VnodeDOM<any, any>
  type BaseNode = Vnode<any, any>
  type Child = string | number | boolean | Vnode<any,any>;
  interface ChildArray extends Array<Children> {}
  type Children = Child | ChildArray;

  interface Vnode<A, S extends Lifecycle<A,S>> {
    tag: string | Component<A,S>;
    attrs: A;
    state: S;
    key?: string;
    children?: Vnode<any,any>[];
    events?: any;
  }

  // In some lifecycle methods, Vnode will have a dom property
  // and possibly a domSize property.
  interface VnodeDOM<A,S> extends Vnode<A,S> {
    dom: Element;
    domSize?: number;
  }

  interface VnodeFactory {
    <A,S>(tag: string | Component<A,S>, key: string | number, attrs: A, children: Children, text: string, dom: Element): DOMNode
  }

  interface Component<A, S extends Lifecycle<A,S>> extends Lifecycle<A,S> {
    view: (this: S, vnode: Vnode<A,S>) => Vnode<any,any> | null | void | (Vnode<any,any> | null | void)[];
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

  type StreamCombiner<T> = (...streams: any[]) => T

  interface StreamFactory {
    <T>(val?: T): Stream<T>;
    combine<T>(combiner: StreamCombiner<T>, streams: Stream<any>[]): Stream<T>;
    merge(streams: Stream<any>[]): Stream<any[]>;
    HALT: any;
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

declare module 'mithril/mount' {
  const m: Mithril.Mount;
  export = m;
}

declare module 'mithril/route' {
  const r: Mithril.Route;
  export = r;
}

declare module 'mithril/request' {
  const r: Mithril.RequestService;
  export = r;
}

declare module 'mithril/render' {
  const r: Mithril.RenderService;
  export = r;
}

declare module 'mithril/redraw' {
  const r: Mithril.RedrawService;
  export = r;
}

declare module 'mithril/util/withAttr' {
  const withAttr: Mithril.WithAttr;
  export = withAttr;
}

declare module 'mithril/stream' {
  const s: Mithril.StreamFactory;
  export = s;
}

declare module 'mithril/render/vnode' {
  const vnode: Mithril.VnodeFactory;
  export = vnode;
}
