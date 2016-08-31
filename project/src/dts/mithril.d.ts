
declare namespace Mithril {
  interface ChildArray extends Array<Children> {}
  type Child = string | Vnode | Component;
  type Children = Child | ChildArray;

  interface Attributes {
    [key: string]: any;
  }

  interface Static {
    (
      selector: string,
      ...children: Children[]
    ): Vnode;

    (
      selector: string,
      attributes: Attributes,
      ...children: Children[]
    ): Vnode;

    (
      selector: Component,
      attributes: Attributes,
      ...children: Children[]
    ): Vnode;

    <T>(
      selector: ComponentWithAttrs<T>,
      attributes: T,
      ...children: Children[]
    ): Vnode;

    prop<T>(value: T): BasicProperty<T>;

    prop<T>(): BasicProperty<T>;

    withAttr(
      property: string,
      callback: (value: any) => any,
      callbackThis?: any
    ): (e: Event) => void;

    trust(html: string): TrustedString;

    render(
      rootElement: Element,
      children: Vnode|Vnode[]
    ): void;

    request(options: any): any;
  }

  interface Vnode {
    tag: string;
    key?: string | number;
    attrs?: Attributes;
    children: Children[];
    text: string | number | boolean;
    dom?: Element;
    domSize?: number;
    state: any;
  }

  interface ComponentVnode<T> extends Vnode {
    attrs?: T
  }

  interface VnodeFactory {
    (tag: string, key: string | number, attrs: Attributes, children: Array<Vnode>, text: string, dom: Element): Vnode
    <T>(tag: Component, key: string | number, attrs: T, children: Array<Vnode>, text: string, dom: Element): Vnode
  }

  interface Component  {
    view(vnode: Vnode): Vnode;

    oninit?(vnode: Vnode): void;
    oncreate?(vnode: Vnode): void;
    onupdate?(vnode: Vnode): void;
    onbeforeremove?(vnode: Vnode, done: () => void): void;
    onremove?(vnode: Vnode): void;
    onbeforeupdate?(vnode: Vnode, old: Vnode): boolean;

    // initial state
    [data: string]: any;
  }

  interface ComponentWithAttrs<T> extends Component {
    view(vnode: ComponentVnode<T>): Vnode;
  }

  interface TrustedString extends String {
    /** @private Implementation detail. Don't depend on it. */
    $trusted: boolean;
  }

  interface Property<T> {
    (): T;

    (value: T): T;
  }

  interface BasicProperty<T> extends Property<T> {
    toJSON(): T;
  }
}

declare namespace JSX {
  import __Mithril = Mithril;

  type Element = any;
  interface IntrinsicElements {
    [type: string]: Element;
  }

  interface ElementClass {
    view: (vnode: __Mithril.Vnode) => __Mithril.Vnode;
  }
}

declare const m: Mithril.Static;
declare const Vnode: Mithril.VnodeFactory;

declare module 'mithril' {
  export = m;
}

declare module 'mithril/render/vnode' {
  export = Vnode;
}
