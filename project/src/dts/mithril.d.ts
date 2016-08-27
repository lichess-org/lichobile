// Mithril type definitions for Typescript

/**
* This is the module containing all the types/declarations/etc. for Mithril
*/
declare namespace Mithril {
  interface ChildArray extends Array<Children> {}
  type Children = Child | ChildArray;
  type Child = string | Vnode | Component;

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

    prop<T>(promise: Thennable<T>): Promise<T>;

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

    /**
    * Send an XHR request to a server. Note that the `url` option is
    * required.
    *
    * @param options The options to use for the request.
    * @return A promise to the returned data, or void if not applicable.
    *
    * @see XHROptions for the available options.
    */
    request(options: XHROptions): any;

    deferred: {
      /**
      * Create a Mithril deferred object. It behaves synchronously if
      * possible, an intentional deviation from Promises/A+. Note that
      * deferreds are completely separate from the redrawing system, and
      * never trigger a redraw on their own.
      *
      * @return A new Mithril deferred instance.
      *
      * @see m.deferred.onerror for the error callback called for Error
      * subclasses
      */
      <T>(): Deferred<T>;

      /**
      * A callback for all uncaught native Error subclasses in deferreds.
      * This defaults to synchronously rethrowing all errors, a deviation
      * from Promises/A+, but the behavior is configurable. To restore
      * Promises/A+-compatible behavior. simply set this to a no-op.
      */
      onerror(e: Error): void;
    }

    /**
    * Takes a list of promises or thennables and returns a Mithril promise
    * that resolves once all in the list are resolved, or rejects if any of
    * them reject.
    *
    * @param promises A list of promises to try to resolve.
    * @return A promise that resolves to all the promises if all resolve, or
    * rejects with the error contained in the first rejection.
    */
    sync<T>(promises: Thennable<T>[]): Promise<T[]>;

  }

  interface TrustedString extends String {
    /** @private Implementation detail. Don't depend on it. */
    $trusted: boolean;
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

  interface VnodeFactory {
    (tag: string | Component, key: string | number, attrs: Attributes, children: Array<Vnode>, text: string, dom: Element): Vnode
  }

  /**
  * An event passed by Mithril to unload event handlers.
  */
  interface Event {
    /**
    * Prevent the default behavior of scrolling the page and updating the
    * URL on next route change.
    */
    preventDefault(): void;
  }

  interface Attributes {
    className?: string;

    key?: string | number;

    [property: string]: any;
  }

  interface Component {

    /**
    * Creates a view out of virtual elements.
    *
    * @see m.component
    */
    view(...args: any[]): Vnode;
  }

  interface Property<T> {
    /**
    * Gets the contained value.
    *
    * @return The contained value.
    */
    (): T;

    /**
    * Sets the contained value.
    *
    * @param value The new value to set.
    * @return The newly set value.
    */
    (value: T): T;
  }

  /**
  * This represents a non-promise getter-setter functions.
  *
  * @see m.prop which returns objects that implement this interface.
  */
  interface BasicProperty<T> extends Property<T> {
    /**
    * Makes this serializable to JSON.
    */
    toJSON(): T;
  }

  /**
  * This represents a Mithril deferred object.
  */
  interface Deferred<T> {
    /**
    * Resolve this deferred's promise with a value.
    *
    * @param value The value to resolve the promise with.
    */
    resolve(value?: T): void;

    /**
    * Reject this deferred with an error.
    *
    * @param value The reason for rejecting the promise.
    */
    reject(reason?: any): void;

    /**
    * The backing promise.
    *
    * @see Promise
    */
    promise: Promise<T>;
  }

  /**
  * This represents a thennable success callback.
  */
  interface SuccessCallback<T, U> {
    (value: T): U | Thennable<U>;
  }

  /**
  * This represents a thennable error callback.
  */
  interface ErrorCallback<T> {
    (value: Error): T | Thennable<T>;
  }

  /**
  * This represents a thennable.
  */
  interface Thennable<T> {
    then<U>(success: SuccessCallback<T, U>): Thennable<U>;
    then<U, V>(success: SuccessCallback<T, U>, error: ErrorCallback<V>): Thennable<U | V>;
    catch?(error: ErrorCallback<T>): Thennable<T>;
    catch?<U>(error: ErrorCallback<U>): Thennable<T | U>;
  }

  /**
   * These are the common options shared across normal and JSONP requests.
   *
   * @see m.request
   */
  interface RequestOptions {
    /**
    * The data to be sent. It's automatically serialized in the right format
    * depending on the method (with exception of HTML5 FormData), and put in
    * the appropriate section of the request.
    */
    data?: any;

    /**
    * Whether to run it in the background, i.e. true if it doesn't affect
    * template rendering.
    */
    background?: boolean;

    /**
    * Set an initial value while the request is working, to populate the
    * promise getter-setter.
    */
    initialValue?: any;

    /**
    * An optional preprocessor function to unwrap a successful response, in
    * case the response contains metadata wrapping the data.
    *
    * @param data The data to unwrap.
    * @return The unwrapped result.
    */
    unwrapSuccess?(data: any): any;

    /**
    * An optional preprocessor function to unwrap an unsuccessful response,
    * in case the response contains metadata wrapping the data.
    *
    * @param data The data to unwrap.
    * @return The unwrapped result.
    */
    unwrapError?(data: any, xhr: XMLHttpRequest): any;

    /**
    * An optional function to serialize the data. This defaults to
    * `JSON.stringify`.
    *
    * @param dataToSerialize The data to serialize.
    * @return The serialized form as a string.
    */
    serialize?(dataToSerialize: any): string;

    /**
    * An optional function to deserialize the data. This defaults to
    * `JSON.parse`.
    *
    * @param dataToSerialize The data to parse.
    * @return The parsed form.
    */
    deserialize?(dataToDeserialize: string): any;

    /**
    * An optional function to extract the data from a raw XMLHttpRequest,
    * useful if the relevant data is in a response header or the status
    * field.
    *
    * @param xhr The associated XMLHttpRequest.
    * @param options The options passed to this request.
    * @return string The serialized format.
    */
    extract?(xhr: XMLHttpRequest, options: this): string;

    /**
    * The parsed data, or its children if it's an array, will be passed to
    * this class constructor if it's given, to parse it into classes.
    *
    * @param data The data to parse.
    * @return The new instance for the list.
    */
    type?: new (data: any) => any;

    /**
    * The URL to send the request to.
    */
    url: string;
  }

  /**
  * This represents the available options for configuring m.request for
  * standard AJAX requests.
  *
  * @see m.request
  */
  interface XHROptions extends RequestOptions {
    /**
    * This represents the HTTP method used, defaulting to "GET".
    */
    method: string;

    /**
    * The username for HTTP authentication.
    */
    user?: string;

    /**
    * The password for HTTP authentication.
    */
    password?: string;

    /**
    * An optional function to run between `open` and `send`, useful for
    * adding request headers or using XHR2 features such as the `upload`
    * property. It is even possible to override the XHR altogether with a
    * similar object, such as an XDomainRequest instance.
    *
    * @param xhr The associated XMLHttpRequest.
    * @param options The options passed to this request.
    * @return The new XMLHttpRequest, or nothing if the same one is kept.
    */
    config?(xhr: XMLHttpRequest, options: this): any;

    /**
     * The data to send with the request.
     */
    data?: Object;
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
