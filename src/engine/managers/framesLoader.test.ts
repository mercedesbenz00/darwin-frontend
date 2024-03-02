import { createLocalVue } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import { createTestStore } from 'test/unit/createTestStore'
import { buildLoadedFrame } from 'test/unit/factories'

import { Editor } from '@/engine/editor'
import { FramesLoader, ItemManager } from '@/engine/managers'
import { VideoView } from '@/engine/models'
import { loadLqFrame, loadHqFrame } from '@/engine/utils'
import { LoadedFrame } from '@/store/modules/workview/types'

const localVue = createLocalVue()
localVue.use(Vuex)

jest.mock('@/engine/utils', () => ({
  loadHqFrame: jest.fn().mockResolvedValue(null),
  loadLqFrame: jest.fn().mockResolvedValue(null),
  getWindowLevelsRange: jest.fn(),
  getCSSFilterString: jest.fn()
}))

let store: ReturnType<typeof createTestStore>
let view: VideoView
let framesLoader: FramesLoader

const frames: { [key: string]: LoadedFrame } = {
  0: {
    seq: 1,
    hqUrl: 'hqurl0',
    lqUrl: 'lqurl0',
    hqData: null,
    lqData: null,
    hqDataLoaded: false,
    lqDataLoaded: false
  },
  1: {
    seq: 1,
    hqUrl: 'hqurl0',
    lqUrl: 'lqurl0',
    hqData: null,
    lqData: null,
    hqDataLoaded: false,
    lqDataLoaded: false
  },
  2: {
    seq: 1,
    hqUrl: 'hqurl0',
    lqUrl: 'lqurl0',
    hqData: null,
    lqData: null,
    hqDataLoaded: false,
    lqDataLoaded: false
  },
  3: {
    seq: 1,
    hqUrl: 'hqurl0',
    lqUrl: 'lqurl0',
    hqData: null,
    lqData: null,
    hqDataLoaded: false,
    lqDataLoaded: false
  }
}

beforeEach(() => {
  store = createTestStore()
  store.commit('workview/SET_HARDWARE_CONCURRENCY', 2)
  const editor = new Editor(
    new ItemManager(store), store
  )
  view = new VideoView(
    editor,
    editor.store,
    {
      toolManager: editor.toolManager,
      actionManager: editor.actionManager
    }
  )

  framesLoader = new FramesLoader(view, editor)
})

afterEach(() => {
  jest.clearAllMocks()
})

it('should trigger frame loaded callback', async () => {
  const callback = jest.fn()
  framesLoader.onFrameLoaded(callback)

  framesLoader.setFramesToLoad(frames)

  await flushPromises()

  expect(callback).toHaveBeenCalledWith(0, frames[0])
})

it('should load HQ frame', () => {
  framesLoader.setFramesToLoad(frames)

  framesLoader.loadHqFrame(frames[0], 0)

  expect(loadHqFrame).toHaveBeenCalledWith(
    frames[0],
    0,
    view
  )
})

it('should change pointer of the next frame to load', async () => {
  framesLoader.setFramesToLoad(frames)
  framesLoader.setNextFrameToLoad(3)

  await flushPromises()

  expect(loadLqFrame).toHaveBeenCalledWith(
    frames[3],
    3,
    expect.anything()
  )
})

it('should return promise of the next frame to load', async () => {
  framesLoader.setFramesToLoad(frames)

  const frame = buildLoadedFrame();

  (loadLqFrame as jest.Mock).mockResolvedValue(frame)

  const promise = framesLoader.setNextFrameToLoad(3)

  expect(await promise).toBe(frame)
})

it('should keep max 2 parallel requests', () => {
  (loadLqFrame as jest.Mock).mockClear()

  framesLoader.setFramesToLoad(frames)

  expect(loadLqFrame).toHaveBeenCalledWith(
    frames[0],
    0,
    expect.anything()
  )
  expect(loadLqFrame).toHaveBeenCalledWith(
    frames[1],
    1,
    expect.anything()
  )
  expect(loadLqFrame).toHaveBeenCalledWith(
    frames[2],
    2,
    expect.anything()
  )
  expect(loadLqFrame).not.toHaveBeenCalledWith(
    frames[3],
    3,
    expect.anything()
  )
})
