declare module 'promise-worker/register'
declare module 'promise-worker'
declare module 'worker-loader!*' {
  // You need to change `Worker`, if you specified a different value for the `workerType` option
  class WebpackWorker extends Worker {
    constructor()
  }

  export default WebpackWorker
}
