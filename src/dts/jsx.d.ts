declare namespace JSX {
  type Element = any
  interface IntrinsicElements {
    [type: string]: Element
  }

  type ElementClass = Mithril.ClassComponent
}
