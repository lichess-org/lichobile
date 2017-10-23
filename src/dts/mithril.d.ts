// Type definitions for mithril.js 1.0
// Project: https://github.com/lhorie/mithril.js
// Definitions by: Mike Linkovich <https://github.com/spacejack>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

// Typescript 2
//
// modified here

declare namespace Mithril {
  interface Lifecycle<Attrs, State> {
    oninit?(this: State, vnode: Vnode<Attrs, State>): any
    oncreate?(this: State, vnode: VnodeDOM<Attrs, State>): any
    onbeforeremove?(this: State, vnode: VnodeDOM<Attrs, State>): Promise<any> | void
    onremove?(this: State, vnode: VnodeDOM<Attrs, State>): any
    onbeforeupdate?(this: State, vnode: Vnode<Attrs, State>, old: VnodeDOM<Attrs, State>): boolean | void
    onupdate?(this: State, vnode: VnodeDOM<Attrs, State>): any
    /** WORKAROUND: TypeScript 2.4 does not allow extending an interface with all-optional properties. */
    [_: number]: any
  }

  interface Hyperscript {
    (selector: string, ...children: any[]): Vnode<any, any>
    (selector: string, ...children: Children[]): Vnode<any, any>
    <A, State>(component: ComponentTypes<A, State>, ...args: Children[]): Vnode<A, State>
    <A, State>(component: ComponentTypes<A, State>, attributes: A & Lifecycle<A, State> & { key?: string | number }, ...args: Children[]): Vnode<A, State>
    fragment(attrs: Lifecycle<any, any> & { [key: string]: any }, children: ChildArrayOrPrimitive): Vnode<any, any>
    trust(html: string): Vnode<any, any>
  }

  interface WithAttr {
    <T>(name: string, stream: Stream<T>, thisArg?: any): (e: {currentTarget: any, [p: string]: any}) => boolean
    (name: string, callback: (value: any) => void, thisArg?: any): (e: {currentTarget: any, [p: string]: any}) => boolean
  }

  interface Render {
    (el: Element, vnodes: Vnode<any, any> | Vnode<any, any>[]): void
  }

  interface RenderService {
    render: Render
  }

  interface Static extends Hyperscript {
    withAttr: WithAttr
    render: Render
    version: string
  }

  // Vnode children types
  type DOMNode = VnodeDOM<any, any>
  type BaseNode = Vnode<any, any>
  type Child = string | number | boolean | Vnode<any, any> | null
  interface ChildArray extends Array<Children> {}
  type Children = Child | ChildArray
  type ChildArrayOrPrimitive = ChildArray | string | number | boolean

  interface Vnode<A, S> {
    tag: string | Component<A, S>
    attrs: A
    state: S
    key?: string
    children?: Vnode<any, any>[]
    events?: any
  }

  // In some lifecycle methods, Vnode will have a dom property
  // and possibly a domSize property.
  interface VnodeDOM<A, S> extends Vnode<A, S> {
    dom: Element
    domSize?: number
  }

  interface VnodeFactory {
    <A, S>(tag: string | Component<A, S>, key?: string, attrs?: A, children?: Children, text?: string, dom?: Element): DOMNode
  }

  interface CVnode<A> extends Vnode<A, ClassComponent<A>> { }

  interface CVnodeDOM<A> extends VnodeDOM<A, ClassComponent<A>> { }

  interface Component<A, S extends Lifecycle<A, S>> extends Lifecycle<A, S> {
    view(this: S, vnode: Vnode<A, S>): Children | void
  }

  interface ClassComponent<A> extends Lifecycle<A, ClassComponent<A>> {
    oninit?(vnode: Vnode<A, this>): any
    oncreate?(vnode: VnodeDOM<A, this>): any
    onbeforeremove?(vnode: VnodeDOM<A, this>): Promise<any> | void
    onremove?(vnode: VnodeDOM<A, this>): any
    onbeforeupdate?(vnode: Vnode<A, this>, old: VnodeDOM<A, this>): boolean | void
    onupdate?(vnode: VnodeDOM<A, this>): any
    view(vnode: Vnode<A, this>): Children | null | void
  }

  type FactoryComponent<A> = (vnode: Vnode<A, {}>) => Component<A, {}>

  type Comp<Attrs, State extends Lifecycle<Attrs, State>> = Component<Attrs, State> & State

  type ComponentTypes<A, S> = Component<A, S> | { new (vnode: CVnode<A>): ClassComponent<A> } | FactoryComponent<A>

  interface Attributes extends Lifecycle<any, any> {
    className?: string
    key?: string | number
    [property: string]: any
  }

  type Unary<T, U> = (input: T) => U

  interface Functor<T> {
    map<U>(f: Unary<T, U>): Functor<U>
    ap?(f: Functor<T>): Functor<T>
  }

  interface Stream<T> {
    (): T
    (value: T): this
    map(f: (current: T) => Stream<T> | T | void): Stream<T>
    map<U>(f: (current: T) => Stream<U> | U): Stream<U>
    of(val?: T): Stream<T>
    ap<U>(f: Stream<(value: T) => U>): Stream<U>
    end: Stream<boolean>
  }

  type StreamCombiner<T> = (...streams: any[]) => T

  interface StreamFactory {
    <T>(val?: T): Stream<T>
    combine<T>(combiner: StreamCombiner<T>, streams: Stream<any>[]): Stream<T>
    merge(streams: Stream<any>[]): Stream<any[]>
    HALT: any
  }
}

declare module 'mithril' {
  const m: Mithril.Static
  export = m
}

declare module 'mithril/hyperscript' {
  const h: Mithril.Hyperscript
  export = h
}

declare module 'mithril/render' {
  const r: Mithril.RenderService
  export = r
}

declare module 'mithril/util/withAttr' {
  const withAttr: Mithril.WithAttr
  export = withAttr
}

declare module 'mithril/stream' {
  const s: Mithril.StreamFactory
  export = s
}

declare module 'mithril/render/vnode' {
  const vnode: Mithril.VnodeFactory
  export = vnode
}
