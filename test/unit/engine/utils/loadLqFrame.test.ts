import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildDatasetItemPayload, buildLoadedFrame, buildLoadedVideo } from 'test/unit/factories'

import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'
import { loadLqFrame } from '@/engine/utils'
import { LoadedFrame, LoadedVideo } from '@/store/modules/workview/types'
import { DatasetItemPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

jest.useFakeTimers()

describe('loadLqFrame', () => {
  let store: ReturnType<typeof createTestStore>
  let editor: Editor
  let loadedVideo: LoadedVideo
  let currentItem: DatasetItemPayload
  let frame: LoadedFrame
  const frameIndex = 0
  let mockImageRemoveFn: jest.Mock

  beforeEach(() => {
    store = createTestStore()
    editor = new Editor(new ItemManager(store), store)
    loadedVideo = buildLoadedVideo({ id: 1, currentFrameIndex: 0 })
    currentItem = buildDatasetItemPayload({ dataset_video_id: 1 })
    jest.spyOn(editor.activeView, 'loadedVideo', 'get').mockReturnValue(loadedVideo)
    jest.spyOn(editor.activeView, 'currentItem', 'get').mockReturnValue(currentItem)
    jest.spyOn(editor.activeView.camera, 'setImage').mockImplementation(() => {})
    jest.spyOn(editor.activeView.mainLayer, 'changed')
    jest.spyOn(store, 'commit').mockImplementation(() => {})
    frame = buildLoadedFrame({ seq: 0 })

    mockImageRemoveFn = jest.fn()
    Object.defineProperty(window, 'Image', {
      value: class {
        constructor () {
          this.onload = () => {}
          this.onerror = () => {}

          setTimeout(() => {
            this.onload()
          }, 100)
        }

        public onload: () => void
        public onerror: () => void
        public remove = mockImageRemoveFn
      }
    })
  })

  describe('loadedVideo is valid', () => {
    beforeEach(() => {
      loadedVideo.currentFrameIndex = 0
    })

    describe('currentFrameIndex = frame.seq', () => {
      beforeEach(() => {
        frame.seq = 0
      })

      describe('lq image not loaded yet', () => {
        beforeEach(() => {
          frame.lqData = null
          frame.lqDataLoaded = false
        })

        it('should load lq image and update editor image', async () => {
          const promise = loadLqFrame(frame, frameIndex, editor.activeView)
          jest.advanceTimersByTime(100)
          const lqData = await promise
          const expectedLqData = {
            data: expect.objectContaining({ src: frame.lqUrl }),
            rawData: null,
            transformedData: null,
            lastWindowLevels: [1, 255],
            lastColorMap: 'default'
          }

          expect(lqData).toEqual(expectedLqData)
          expect(frame.lqData).toEqual(expectedLqData)
          expect(frame.lqDataLoaded).toBeTruthy()
          expect(store.commit).toHaveBeenCalledWith('workview/SET_LOADED_VIDEO_FRAME_LOADED', {
            datasetVideoId: loadedVideo.id,
            frameIndex,
            frame
          })
          expect(editor.activeView.camera.setImage).toHaveBeenCalledWith(expect.any(Object), false)
          expect(editor.activeView.mainLayer.changed).toHaveBeenCalled()
        })
      })

      describe('lq image loaded already', () => {
        beforeEach(() => {
          frame.lqData = {
            data: new Image(),
            rawData: null,
            transformedData: null,
            lastWindowLevels: [1, 255],
            lastColorMap: 'default'
          }
          frame.lqDataLoaded = true
        })

        it('should never load again and update editor image', async () => {
          const lqData = await loadLqFrame(frame, frameIndex, editor.activeView)
          const expectedLqData = {
            data: expect.any(Image),
            rawData: null,
            transformedData: null,
            lastWindowLevels: [1, 255],
            lastColorMap: 'default'
          }

          expect(lqData).toEqual(expectedLqData)
          expect(store.commit).not.toHaveBeenCalled()
          expect(editor.activeView.camera.setImage).toHaveBeenCalledWith(expect.any(Image), false)
          expect(editor.activeView.mainLayer.changed).toHaveBeenCalled()
        })
      })
    })

    describe('currentFrameIndex != frame.seq', () => {
      beforeEach(() => {
        frame.seq = 1
      })

      describe('lqData not loaded yet', () => {
        beforeEach(() => {
          frame.lqData = null
          frame.lqDataLoaded = false
        })

        it('should load lq frame and update editor image', async () => {
          const promise = loadLqFrame(frame, frameIndex, editor.activeView)
          jest.advanceTimersByTime(100)
          const lqData = await promise
          const expectedLqData = {
            data: expect.objectContaining({ src: frame.lqUrl }),
            rawData: null,
            transformedData: null,
            lastWindowLevels: [1, 255],
            lastColorMap: 'default'
          }

          expect(lqData).toEqual(expectedLqData)
          expect(frame.lqData).toEqual(expectedLqData)
          expect(frame.lqDataLoaded).toBeTruthy()
          expect(store.commit).toHaveBeenCalledWith('workview/SET_LOADED_VIDEO_FRAME_LOADED', {
            datasetVideoId: loadedVideo.id,
            frameIndex,
            frame
          })
          expect(editor.activeView.camera.setImage).not.toHaveBeenCalled()
          expect(editor.activeView.mainLayer.changed).not.toHaveBeenCalled()
        })
      })

      describe('lqData loaded already', () => {
        beforeEach(() => {
          frame.lqData = {
            data: new Image(),
            rawData: null,
            transformedData: null,
            lastWindowLevels: [1, 255],
            lastColorMap: 'default'
          }
          frame.lqDataLoaded = true
        })

        it('should never load again and not update editor image', async () => {
          const lqData = await loadLqFrame(frame, frameIndex, editor.activeView)
          const expectedLqData = {
            data: expect.any(Image),
            rawData: null,
            transformedData: null,
            lastWindowLevels: [1, 255],
            lastColorMap: 'default'
          }

          expect(lqData).toEqual(expectedLqData)
          expect(store.commit).not.toHaveBeenCalled()
          expect(editor.activeView.camera.setImage).not.toHaveBeenCalled()
          expect(editor.activeView.mainLayer.changed).not.toHaveBeenCalled()
        })
      })
    })
  })

  describe('loadedVideo is null', () => {
    describe('lqData not loaded yet', () => {
      beforeEach(() => {
        frame.lqData = null
        frame.lqDataLoaded = false
      })

      it('should not save loaded image', async () => {
        const promise = loadLqFrame(frame, frameIndex, editor.activeView)
        jest.spyOn(editor.activeView, 'loadedVideo', 'get').mockReturnValue(null)
        jest.advanceTimersByTime(100)
        const lqData = await promise

        expect(mockImageRemoveFn).toHaveBeenCalled()
        expect(lqData).toBeNull()
        expect(frame.lqData).toBeNull()
        expect(frame.lqDataLoaded).toBeFalsy()
        expect(store.commit).not.toHaveBeenCalled()
        expect(editor.activeView.camera.setImage).not.toHaveBeenCalled()
        expect(editor.activeView.mainLayer.changed).not.toHaveBeenCalled()
      })
    })

    describe('lqData loaded already', () => {
      beforeEach(() => {
        frame.lqData = {
          data: new Image(),
          rawData: null,
          transformedData: null,
          lastWindowLevels: [1, 255],
          lastColorMap: 'default'
        }
        frame.lqDataLoaded = true
      })

      it('should not save loaded image', async () => {
        jest.spyOn(editor.activeView, 'loadedVideo', 'get').mockReturnValue(null)
        const lqData = await loadLqFrame(frame, frameIndex, editor.activeView)

        expect(lqData).toBeNull()
        expect(frame.lqData).toBeNull()
        expect(frame.lqDataLoaded).toBeFalsy()
        expect(mockImageRemoveFn).toHaveBeenCalled()
        expect(store.commit).not.toHaveBeenCalled()
        expect(editor.activeView.camera.setImage).not.toHaveBeenCalled()
        expect(editor.activeView.mainLayer.changed).not.toHaveBeenCalled()
      })
    })
  })
})
