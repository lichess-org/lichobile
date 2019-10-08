declare namespace JSX {
  type Element = any
  interface IntrinsicElements {
    [type: string]: Element
  }

  interface ElementClass {
    view: any
  }
}
