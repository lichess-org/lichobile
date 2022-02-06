declare namespace JSX {
  type Element = any
  interface IntrinsicElements {
    [type: string]: Mithril.Attributes
  }

  type ElementClass = Mithril.ClassComponent
}
