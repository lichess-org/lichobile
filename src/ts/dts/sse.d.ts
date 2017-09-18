// Type definitions for Server-Sent Events
// Specification: http://dev.w3.org/html5/eventsource/
// Definitions by: Yannik Hampe <https://github.com/yankee42>

declare var EventSource : sse.IEventSourceStatic;

declare module sse {
    
    enum ReadyState {CONNECTING = 0, OPEN = 1, CLOSED = 2}
    
    interface IEventSourceStatic extends EventTarget {
        new (url: string, eventSourceInitDict?: IEventSourceInit): IEventSourceStatic;
        url: string;
        withCredentials: boolean;
        CONNECTING: ReadyState; // constant, always 0
        OPEN: ReadyState; // constant, always 1
        CLOSED: ReadyState; // constant, always 2
        readyState: ReadyState;
        onopen: Function;
        onmessage: (event: IOnMessageEvent) => void;
        onerror: Function;
        close: () => void;
    }
    
    interface IEventSourceInit {
        withCredentials?: boolean;
    }
    
    interface IOnMessageEvent {
        data: string;
    }
}
