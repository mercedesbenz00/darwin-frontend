import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildDatasetItemPayload, buildLoadedFrame, buildLoadedVideo } from 'test/unit/factories'

import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'
import { loadHqFrame } from '@/engine/utils'
import { LoadedFrame, LoadedVideo } from '@/store/modules/workview/types'
import { DatasetItemPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

jest.useFakeTimers()

describe('loadHqFrame', () => {
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

      describe('hq image not loaded yet', () => {
        beforeEach(() => {
          frame.hqData = null
          frame.hqDataLoaded = false
        })

        it('should load hq image and update editor image', async () => {
          const promise = loadHqFrame(frame, frameIndex, editor.activeView)
          jest.advanceTimersByTime(100)
          const hqData = await promise
          const expectedHqData = {
            data: expect.objectContaining({ src: frame.hqUrl }),
            rawData: null,
            transformedData: null,
            lastWindowLevels: [1, 255],
            lastColorMap: 'default'
          }

          expect(hqData).toEqual(expectedHqData)
          expect(frame.hqData).toEqual(expectedHqData)
          expect(frame.hqDataLoaded).toBeTruthy()
          expect(store.commit).toHaveBeenCalledWith('workview/SET_LOADED_VIDEO_FRAME_LOADED', {
            datasetVideoId: loadedVideo.id,
            frameIndex,
            frame
          })
          expect(editor.activeView.camera.setImage).toHaveBeenCalledWith(expect.any(Object), false)
          expect(editor.activeView.mainLayer.changed).toHaveBeenCalled()
        })
      })

      describe('hq image loaded already', () => {
        beforeEach(() => {
          frame.hqData = {
            data: new Image(),
            rawData: null,
            transformedData: null,
            lastWindowLevels: [1, 255],
            lastColorMap: 'default'
          }
          frame.hqDataLoaded = true
        })

        it('should never load again and update editor image', async () => {
          const hqData = await loadHqFrame(frame, frameIndex, editor.activeView)
          const expectedHqData = {
            data: expect.any(Image),
            rawData: null,
            transformedData: null,
            lastWindowLevels: [1, 255],
            lastColorMap: 'default'
          }

          expect(hqData).toEqual(expectedHqData)
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

      describe('hqData not loaded yet', () => {
        beforeEach(() => {
          frame.hqData = null
          frame.hqDataLoaded = false
        })

        it('should load hq frame and update editor image', async () => {
          const promise = loadHqFrame(frame, frameIndex, editor.activeView)
          jest.advanceTimersByTime(100)
          const hqData = await promise
          const expectedHqData = {
            data: expect.objectContaining({ src: frame.hqUrl }),
            rawData: null,
            transformedData: null,
            lastWindowLevels: [1, 255],
            lastColorMap: 'default'
          }

          expect(hqData).toEqual(expectedHqData)
          expect(frame.hqData).toEqual(expectedHqData)
          expect(frame.hqDataLoaded).toBeTruthy()
          expect(store.commit).toHaveBeenCalledWith('workview/SET_LOADED_VIDEO_FRAME_LOADED', {
            datasetVideoId: loadedVideo.id,
            frameIndex,
            frame
          })
          expect(editor.activeView.camera.setImage).not.toHaveBeenCalled()
          expect(editor.activeView.mainLayer.changed).not.toHaveBeenCalled()
        })
      })

      describe('hqData loaded already', () => {
        beforeEach(() => {
          frame.hqData = {
            data: new Image(),
            rawData: null,
            transformedData: null,
            lastWindowLevels: [1, 255],
            lastColorMap: 'default'
          }
          frame.hqDataLoaded = true
        })

        it('should never load again and not update editor image', async () => {
          const hqData = await loadHqFrame(frame, frameIndex, editor.activeView)
          const expectedHqData = {
            data: expect.any(Image),
            rawData: null,
            transformedData: null,
            lastWindowLevels: [1, 255],
            lastColorMap: 'default'
          }

          expect(hqData).toEqual(expectedHqData)
          expect(store.commit).not.toHaveBeenCalled()
          expect(editor.activeView.camera.setImage).not.toHaveBeenCalled()
          expect(editor.activeView.mainLayer.changed).not.toHaveBeenCalled()
        })
      })
    })
  })

  describe('loadedVideo is null', () => {
    describe('hqData not loaded yet', () => {
      beforeEach(() => {
        frame.hqData = null
        frame.hqDataLoaded = false
      })

      it('should not save loaded image', async () => {
        const promise = loadHqFrame(frame, frameIndex, editor.activeView)
        jest.spyOn(editor.activeView, 'loadedVideo', 'get').mockReturnValue(null)
        jest.advanceTimersByTime(100)
        const hqData = await promise

        expect(mockImageRemoveFn).toHaveBeenCalled()
        expect(hqData).toBeNull()
        expect(frame.hqData).toBeNull()
        expect(frame.hqDataLoaded).toBeFalsy()
        expect(store.commit).not.toHaveBeenCalled()
        expect(editor.activeView.camera.setImage).not.toHaveBeenCalled()
        expect(editor.activeView.mainLayer.changed).not.toHaveBeenCalled()
      })
    })

    describe('hqData loaded already', () => {
      beforeEach(() => {
        frame.hqData = {
          data: new Image(),
          rawData: null,
          transformedData: null,
          lastWindowLevels: [1, 255],
          lastColorMap: 'default'
        }
        frame.hqDataLoaded = true
      })

      it('should not save loaded image', async () => {
        jest.spyOn(editor.activeView, 'loadedVideo', 'get').mockReturnValue(null)
        const hqData = await loadHqFrame(frame, frameIndex, editor.activeView)

        expect(hqData).toBeNull()
        expect(frame.hqData).toBeNull()
        expect(frame.hqDataLoaded).toBeFalsy()
        expect(mockImageRemoveFn).toHaveBeenCalled()
        expect(store.commit).not.toHaveBeenCalled()
        expect(editor.activeView.camera.setImage).not.toHaveBeenCalled()
        expect(editor.activeView.mainLayer.changed).not.toHaveBeenCalled()
      })
    })
  })
})
