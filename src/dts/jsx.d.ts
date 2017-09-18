declare namespace JSX {
  import __Mithril = Mithril;

  type Element = any;
  interface IntrinsicElements {
    [type: string]: Element;
  }

  interface ElementClass {
    view: (vnode: __Mithril.Vnode<any, any>) => __Mithril.Children;
  }
}
