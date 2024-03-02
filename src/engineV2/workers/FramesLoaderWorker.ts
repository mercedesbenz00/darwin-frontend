import PromiseWorker from 'promise-worker'
import Worker from 'worker-loader!@/engineV2/workers/FramesLoaderWorker/worker'

import { V2SlotSection } from '@/store/types'

import { Actions } from './FramesLoaderWorker/types'

type Event = {
  data: {
    type: Actions,
    [key: string]: any
  }
}

/**
 * Provides a public interface to work with frames loader
 */
export class FramesLoaderWorker {
  private worker: Worker
  private promiseWorker: any

  constructor () {
    this.worker = new Worker()
    this.promiseWorker = new PromiseWorker(this.worker)
  }

  onFrameLoaded (callback: (index: number, frameObjectURL: string, isHQ: boolean) => void): void {
    this.worker.addEventListener(
      'message',
      (event: Event) => {
        if (event.data.type === Actions.onFrameLoaded) {
          callback(event.data.index, event.data.frameObjectURL, event.data.isHQ)
        }
      }
    )
  }

  onGetSection (callback: (index: number) => void): void {
    this.worker.addEventListener(
      'message',
      (event: Event) => {
        if (event.data.type === Actions.onGetSection) {
          callback(event.data.index)
        }
      }
    )
  }

  pushSections (sections: V2SlotSection[]): Promise<void> {
    return this.promiseWorker.postMessage({
      type: Actions.pushSections,
      payload: { sections }
    })
  }

  loadLQFrame (
    index: number
  ): Promise<string> {
    return this.promiseWorker.postMessage({
      type: Actions.loadLQFrame,
      payload: { index }
    })
  }

  loadHQFrame (
    index: number
  ): Promise<string> {
    return this.promiseWorker.postMessage({
      type: Actions.loadHQFrame,
      payload: { index }
    })
  }

  setFramesToLoad (framesIndexes: number[]): Promise<void> {
    return this.promiseWorker.postMessage({
      type: Actions.setFramesToLoad,
      payload: { framesIndexes }
    })
  }

  setNextFrameToLoad (index: number): Promise<string | undefined> {
    return this.promiseWorker.postMessage({
      type: Actions.setNextFrameToLoad,
      payload: { index }
    })
  }

  async cleanup (): Promise<void> {
    await this.promiseWorker.postMessage({
      type: Actions.cleanup
    })
    this.worker.terminate()
  }
}
