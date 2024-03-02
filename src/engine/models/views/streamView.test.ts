import { createLocalVue } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Hls from 'hls.js'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildDatasetVideoPayload,
  buildDatasetItemPayload,
  buildLoadedVideo
} from 'test/unit/factories'

import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'
import { View, StreamView } from '@/engine/models/views'

const localVue = createLocalVue()
localVue.use(Vuex)

let editor: Editor
let store: ReturnType<typeof createTestStore>
let streamView: StreamView

let playSpy: jest.SpyInstance
let pauseSpy: jest.SpyInstance
let removeSpy: jest.SpyInstance

jest.mock('@/engine/utils', () => ({
  loadHqFrame: jest.fn().mockResolvedValue(null),
  loadLqFrame: jest.fn().mockResolvedValue(null),
  getWindowLevelsRange: jest.fn(),
  getCSSFilterString: jest.fn()
}))

jest.mock('hls.js', () => {
  const HLS = {
    destroy: jest.fn(),
    attachMedia: jest.fn(),
    once: (key: never, cl: () => void): void => {
      cl()
    },
    on: jest.fn(),
    loadSource: jest.fn()
  }

  const func: any = jest.fn().mockImplementation(() => HLS)
  func.prototype = HLS

  func.Events = {
    MEDIA_ATTACHED: 'MEDIA_ATTACHED'
  }

  return func
})

jest.useFakeTimers()

beforeEach(async () => {
  store = createTestStore()
  const itemManager = new ItemManager(store)
  const loadedVideo = buildLoadedVideo({
    frames: {
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
        seq: 2,
        hqUrl: 'hqurl1',
        lqUrl: 'lqurl1',
        hqData: null,
        lqData: null,
        hqDataLoaded: false,
        lqDataLoaded: false
      },
      2: {
        seq: 2,
        hqUrl: 'hqurl1',
        lqUrl: 'lqurl1',
        hqData: null,
        lqData: null,
        hqDataLoaded: false,
        lqDataLoaded: false
      },
      3: {
        seq: 2,
        hqUrl: 'hqurl1',
        lqUrl: 'lqurl1',
        hqData: null,
        lqData: null,
        hqDataLoaded: false,
        lqDataLoaded: false
      },
      4: {
        seq: 2,
        hqUrl: 'hqurl1',
        lqUrl: 'lqurl1',
        hqData: null,
        lqData: null,
        hqDataLoaded: false,
        lqDataLoaded: false
      }
    }
  })

  jest.spyOn(itemManager, 'loadVideoItem').mockResolvedValue({ data: loadedVideo })
  editor = new Editor(itemManager, store)

  streamView = new StreamView(
    editor,
    editor.store,
    {
      toolManager: editor.toolManager,
      actionManager: editor.actionManager
    }
  )

  streamView.setItem(buildDatasetItemPayload({
    id: 101,
    dataset_image: null,
    dataset_image_id: null,
    dataset_video_id: 1,
    dataset_video: buildDatasetVideoPayload({ total_frames: 5, id: 1 })
  }))

  await flushPromises()

  playSpy = jest
    .spyOn(window.HTMLMediaElement.prototype, 'play')
    .mockImplementation(() => Promise.resolve())
  pauseSpy = jest
    .spyOn(window.HTMLMediaElement.prototype, 'pause')
    .mockImplementation(() => Promise.resolve())
  removeSpy = jest
    .spyOn(window.HTMLMediaElement.prototype, 'remove')
    .mockImplementation(() => Promise.resolve())
})

afterEach(() => {
  jest.clearAllMocks()
})

it('should subscribe to the video stream', async () => {
  // eslint-disable-next-line
  new StreamView(
    editor,
    editor.store,
    {
      toolManager: editor.toolManager,
      actionManager: editor.actionManager
    }
  )

  expect(Hls).toHaveBeenCalled()
  await flushPromises()
  expect(Hls.prototype.attachMedia).toHaveBeenCalledWith(expect.any(HTMLVideoElement))
  expect(Hls.prototype.loadSource)
    .toHaveBeenCalledWith('https://darwin.v7labs.com/api/dataset_items/101/stream')
})

describe('playVideo', () => {
  it('should play the video', () => {
    streamView.loadedVideo = buildLoadedVideo()

    streamView.playVideo()

    // To exit the loop
    streamView.isPlaying = false

    expect(playSpy).toHaveBeenCalled()
  })

  it('should update current frame regarding videos current time', () => {
    streamView.playVideo()

    jest.spyOn(streamView.video!, 'duration', 'get').mockReturnValue(100)
    streamView.video!.currentTime = 79

    jest.advanceTimersByTime(1000)

    expect(streamView.currentFrameIndex).toBe(4)
  })
})

describe('stopVideo', () => {
  beforeEach(() => {
    jest.spyOn(streamView.video!, 'duration', 'get').mockReturnValue(100)
    streamView.video!.currentTime = 79

    streamView.playVideo()

    jest.advanceTimersByTime(1000)
  })

  it('should replay video after ending', () => {
    streamView.video!.currentTime = 99
    jest.advanceTimersByTime(1000)

    expect(playSpy).toHaveBeenCalled()
  })

  it('should stop the video', () => {
    streamView.stopVideo()

    expect(pauseSpy).toHaveBeenCalled()
  })
})

describe('setItem', () => {
  it('should reset current video stream', () => {
    streamView.setItem(null)

    expect(removeSpy).toHaveBeenCalled()
    expect(Hls.prototype.destroy).toHaveBeenCalled()
  })

  it('should init new video stream', async () => {
    (Hls as any).mockClear()
    streamView.setItem(buildDatasetItemPayload({ id: 111 }))

    await flushPromises()

    expect(Hls).toHaveBeenCalled()
  })
})

it('jumpToFrame should update videos current time', () => {
  jest.spyOn(streamView.video!, 'duration', 'get').mockReturnValue(100)
  jest.spyOn(View.prototype, 'jumpToFrame').mockImplementation(() => Promise.resolve())

  streamView.jumpToFrame(2)

  expect(streamView.video!.currentTime).toBe(40)
})

it('repaint should render video stream', () => {
  jest.spyOn(streamView.renderManager, 'renderStreamVideo')

  streamView.mainLayer.changed()

  streamView.render()

  expect(streamView.renderManager.renderStreamVideo).toHaveBeenCalled()
})
