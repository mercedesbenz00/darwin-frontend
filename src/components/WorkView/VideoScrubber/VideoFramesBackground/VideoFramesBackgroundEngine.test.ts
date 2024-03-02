import { buildLoadedFrame, buildRenderableImage } from 'test/unit/factories'

import {
  VideoFramesBackgroundEngine
} from '@/components/WorkView/VideoScrubber/VideoFramesBackground/VideoFramesBackgroundEngine'
import { LoadedVideo } from '@/store/modules/workview/types'

let engine: VideoFramesBackgroundEngine
let canvas: HTMLCanvasElement
let frames: LoadedVideo['frames']
const height = 100
let contextMock: Pick<
  CanvasRenderingContext2D,
  'beginPath' |
  'clearRect' |
  'fillRect' |
  'save' |
  'rect' |
  'fill' |
  'restore' |
  'strokeRect' |
  'strokeStyle' |
  'fillStyle' |
  'createPattern' |
  'lineWidth'
>

jest.useFakeTimers()

beforeEach(() => {
  window.requestAnimationFrame = jest.fn().mockImplementation(cb => cb())
  engine = new VideoFramesBackgroundEngine()
  frames = { 0: buildLoadedFrame() }
  canvas = document.createElement('canvas') as HTMLCanvasElement
  contextMock = {
    beginPath: jest.fn(),
    clearRect: jest.fn(),
    fillRect: jest.fn(),
    save: jest.fn(),
    rect: jest.fn(),
    fill: jest.fn(),
    createPattern: jest.fn().mockReturnValue('#000'),
    restore: jest.fn(),
    strokeRect: jest.fn(),
    strokeStyle: 'transparent',
    fillStyle: 'transparent',
    lineWidth: 0
  }
  canvas.getContext = jest.fn().mockReturnValue(contextMock)
  jest.spyOn(canvas, 'clientHeight', 'get').mockReturnValue(200)
  jest.spyOn(canvas, 'clientWidth', 'get').mockReturnValue(100)
})

describe('when frames and canvas are set', () => {
  beforeEach(() => {
    engine.setCanvas(canvas)
    engine.setFrameLineWidth(5)
    engine.setHeight(height)
    engine.setFramesCount(1)

    jest.clearAllMocks()
  })

  it('should redraw all frames on setCanvas', () => {
    engine.setCanvas(canvas)

    expect(contextMock.createPattern).toHaveBeenCalledTimes(1)
  })

  it('should redraw all frames on setFrames', () => {
    engine.setFrames({})

    expect(contextMock.createPattern).toHaveBeenCalledTimes(1)
  })

  it('should redraw all frames on setFrameLineWidth', () => {
    engine.setFrameLineWidth(3)

    expect(contextMock.createPattern).toHaveBeenCalledTimes(1)
  })

  it('should redraw all frames on setHeight', () => {
    engine.setHeight(30)

    expect(contextMock.createPattern).toHaveBeenCalledTimes(1)
  })

  it('should remember loaded frames', () => {
    const markFrameAsLoadedSpy = jest.spyOn(engine, 'markFrameAsLoaded')

    engine.markFrameAsLoaded(5)
    engine.markFrameAsLoaded(8)
    engine.markFrameAsLoaded(12)

    markFrameAsLoadedSpy.mockClear()

    jest.runAllTimers()

    engine.setFrameLineWidth(3)

    jest.runAllTimers()

    expect(markFrameAsLoadedSpy).toHaveBeenCalledWith(5)
    expect(markFrameAsLoadedSpy).toHaveBeenCalledWith(8)
    expect(markFrameAsLoadedSpy).toHaveBeenCalledWith(12)
  })

  it('should reset loaded frames indexes on frames update', () => {
    const markFrameAsLoadedSpy = jest.spyOn(engine, 'markFrameAsLoaded')

    engine.markFrameAsLoaded(0)
    engine.markFrameAsLoaded(1)
    engine.markFrameAsLoaded(2)
    engine.markFrameAsLoaded(3)

    jest.runAllTimers()

    markFrameAsLoadedSpy.mockClear()

    frames = {
      0: buildLoadedFrame({ hqDataLoaded: false, lqDataLoaded: false }),
      1: buildLoadedFrame({ hqDataLoaded: false, lqDataLoaded: false }),
      2: buildLoadedFrame({ hqDataLoaded: false, lqDataLoaded: false }),
      3: buildLoadedFrame({ hqDataLoaded: false, lqDataLoaded: false }),
      5: buildLoadedFrame({ hqDataLoaded: false, lqDataLoaded: false }),
      6: buildLoadedFrame({ hqDataLoaded: false, lqDataLoaded: false })
    }
    engine.setFrames(frames)

    jest.runAllTimers()

    expect(markFrameAsLoadedSpy).not.toHaveBeenCalledWith(0)
    expect(markFrameAsLoadedSpy).not.toHaveBeenCalledWith(1)
    expect(markFrameAsLoadedSpy).not.toHaveBeenCalledWith(2)
    expect(markFrameAsLoadedSpy).not.toHaveBeenCalledWith(3)
  })

  it('should draw loaded frame', () => {
    engine.markFrameAsLoaded(0)
    expect(contextMock.beginPath).toHaveBeenCalledTimes(1)
    expect(contextMock.fillStyle).toEqual('#DAE4ED')
    expect(contextMock.rect).toHaveBeenCalledWith(0, 0, 4, 100)
    expect(contextMock.fill).toHaveBeenCalled()
    expect(contextMock.restore).toHaveBeenCalled()
  })

  it('should draw hq loaded frame', () => {
    frames = {
      0: buildLoadedFrame({
        hqData: buildRenderableImage(),
        lqData: null
      })
    }
    engine.setFrames(frames)
    jest.runAllTimers()
    expect(contextMock.clearRect).toHaveBeenCalledWith(0, 0, 5, 100)
    expect(contextMock.createPattern).toHaveBeenCalledTimes(1)

    // usually, debounce would double these calls, as they get run on both
    // leading and trailing edge, but since we stub out debounce to run immediately
    // this doesn't happen
    expect(contextMock.beginPath).toHaveBeenCalledTimes(1)

    expect(contextMock.fillStyle).toEqual('#DAE4ED')
    expect(contextMock.rect).toHaveBeenCalledWith(0, 0, 4, 100)
    expect(contextMock.fill).toHaveBeenCalled()
    expect(contextMock.restore).toHaveBeenCalled()
  })

  it('should draw lq loaded frame', () => {
    frames = {
      0: buildLoadedFrame({
        hqData: null,
        lqData: buildRenderableImage()
      })
    }
    engine.setFrames(frames)
    jest.runAllTimers()
    expect(contextMock.clearRect).toHaveBeenCalledWith(0, 0, 5, 100)
    expect(contextMock.createPattern).toHaveBeenCalledTimes(1)

    // usually, debounce would double these calls, as they get run on both
    // leading and trailing edge, but since we stub out debounce to run immediately
    // this doesn't happen
    expect(contextMock.beginPath).toHaveBeenCalledTimes(1)

    expect(contextMock.fillStyle).toEqual('#DAE4ED')
    expect(contextMock.rect).toHaveBeenCalledWith(0, 0, 4, 100)
    expect(contextMock.fill).toHaveBeenCalled()
    expect(contextMock.restore).toHaveBeenCalled()
  })

  it('should draw hq/lq unloaded frame', () => {
    frames = { 0: buildLoadedFrame({ hqData: null, lqData: null }) }
    engine.setFrames(frames)
    jest.runAllTimers()
    expect(contextMock.clearRect).toHaveBeenCalledWith(0, 0, 5, 100)
    expect(contextMock.createPattern).toHaveBeenCalledTimes(1)
    expect(contextMock.beginPath).toHaveBeenCalledTimes(0)
    expect(contextMock.fillStyle).toEqual('#000')
  })

  it('should draw 4 frames', () => {
    frames = {
      0: buildLoadedFrame({
        hqData: buildRenderableImage(),
        lqData: buildRenderableImage()
      }),
      1: buildLoadedFrame({
        hqData: null,
        lqData: buildRenderableImage()
      }),
      2: buildLoadedFrame({
        hqData: buildRenderableImage(),
        lqData: null
      }),
      3: buildLoadedFrame({
        hqData: null,
        lqData: null
      })
    }
    engine.setFrames(frames)
    jest.runAllTimers()
    expect(contextMock.clearRect).toHaveBeenCalledTimes(1)
    expect(contextMock.clearRect).toHaveBeenCalledWith(0, 0, 5, 100)
    expect(contextMock.createPattern).toHaveBeenCalledTimes(1)

    // usually, debounce would double these calls, as they get run on both
    // leading and trailing edge, but since we stub out debounce to run immediately
    // this doesn't happen
    expect(contextMock.beginPath).toHaveBeenCalledTimes(3)
    expect(contextMock.rect).toHaveBeenCalledTimes(3)
    expect(contextMock.fill).toHaveBeenCalledTimes(3)
    expect(contextMock.restore).toHaveBeenCalledTimes(3)
  })
})
