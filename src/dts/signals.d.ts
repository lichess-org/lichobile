declare module "signals" {
  interface Listener {
    (params: any): void;
  }
  type Context = Object;

  export class Signal {
    constructor();

    add(listener: Listener, context?: Context, priority?: number): any;
    removeAll(): void;
    dispatch(params?: any): void;
    remove(listener: Listener, context?: Context): Listener;
  }
}
