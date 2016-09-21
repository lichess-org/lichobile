export interface WorkerMessage<T> {
  topic: string;
  payload?: T;
}

export function tellWorker<A>(worker: Worker, topic: string, payload?: A): void {
  if (payload !== undefined) {
    worker.postMessage({ topic, payload });
  } else {
    worker.postMessage({ topic });
  }
}

export function askWorker<A, B>(worker: Worker, msg: WorkerMessage<A>): Promise<B> {
  return new Promise(function(resolve, reject) {
    function listen(e: MessageEvent) {
      if (e.data.topic === msg.topic) {
        worker.removeEventListener('message', listen);
        resolve(e.data.payload);
      } else if (e.data.topic === 'error' && e.data.payload.callerTopic === msg.topic) {
        worker.removeEventListener('message', listen);
        reject(e.data.payload.error);
      }
    }
    worker.addEventListener('message', listen);
    worker.postMessage(msg);
  });
}
