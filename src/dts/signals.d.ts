declare module "signals" {
  type Listener<T> = (...params: T[]) => void
  type Context = unknown
  type SignalBinding = unknown

  export class Signal<T = unknown> {
    constructor();

    add(listener: Listener<T>, context?: Context, priority?: number): SignalBinding;
    removeAll(): void;
    dispatch(params?: unknown): void;
    remove(listener: Listener<T>, context?: Context): Listener<T>;
  }
}
