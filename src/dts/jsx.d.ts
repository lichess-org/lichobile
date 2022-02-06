declare namespace JSX {
  type Element = Mithril.Vnode
  interface IntrinsicElements {
    [type: string]: Mithril.Attributes
  }

  type ElementClass = Mithril.ClassComponent
}
