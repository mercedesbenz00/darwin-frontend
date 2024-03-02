import registerPromiseWorker from 'promise-worker/register'

import { FramesLoader } from './framesLoader'
import { Actions } from './types'

const framesLoader = new FramesLoader()

type WorkerPayload = {
  type: Actions,
  payload: any
}

/**
 * Wraps worker calls into the promise
 */
registerPromiseWorker(({ type, payload }: WorkerPayload): any => {
  switch (type) {
  case Actions.pushSections: {
    return framesLoader.pushSections(payload.sections)
  }
  case Actions.loadLQFrame: {
    return framesLoader.loadLQFrame(payload.index)
  }
  case Actions.loadHQFrame: {
    return framesLoader.loadHQFrame(payload.index)
  }
  case Actions.setFramesToLoad: {
    return framesLoader.setFramesToLoad(payload.framesIndexes)
  }
  case Actions.setNextFrameToLoad: {
    return framesLoader.setNextFrameToLoad(payload.index)
  }
  case Actions.cleanup: {
    return framesLoader.cleanup()
  }
  }
})
