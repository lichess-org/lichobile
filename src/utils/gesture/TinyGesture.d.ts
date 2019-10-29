
export default class TinyGesture {
  constructor(el: HTMLElement, vd: { vh: number, vw: number }, opts?: any)

  public on(event: string, fn: (e: TouchEvent) => void): void
  public off(event: string, fn: (e: TouchEvent) => void): void
  public destroy(): void

  public touchStartX: number
  public touchStartY: number
  public touchMoveX: number
  public touchMoveY: number
  public velocityX: number
}
