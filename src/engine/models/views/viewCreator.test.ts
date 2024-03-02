import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildDatasetDicomPayload,
  buildDatasetItemPayload,
  buildDatasetVideoPayload
} from 'test/unit/factories'

import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'
import { StreamView, View, VideoView, ViewCreator } from '@/engine/models'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let viewCreator: ViewCreator

beforeEach(() => {
  store = createTestStore()
  store.commit('features/SET_FEATURES', [{ name: 'VIDEO_STREAM', enabled: true }])
  viewCreator = new ViewCreator(new Editor(new ItemManager(store), store))
})

it('should identify streamable video item', () => {
  expect(viewCreator.isVideoStreamItem(buildDatasetItemPayload({
    dataset_image: null,
    dataset_video: buildDatasetVideoPayload({
      streamable: true
    })
  }))).toBeTruthy()

  expect(viewCreator.isVideoStreamItem(buildDatasetItemPayload({
    dataset_image: null,
    dataset_video: buildDatasetVideoPayload()
  }))).toBeFalsy()
})

describe('getItemConstructor', () => {
  it('should return StreamView for streamable video item', () => {
    expect(viewCreator.getItemConstructor(
      buildDatasetItemPayload({
        dataset_video: buildDatasetVideoPayload({
          streamable: true
        })
      })
    )).toBe(StreamView)
  })

  it('should return View for item === null', () => {
    expect(viewCreator.getItemConstructor(null)).toBe(View)
  })

  it('should return View for image item', () => {
    expect(viewCreator.getItemConstructor(
      buildDatasetItemPayload()
    )).toBe(View)
  })

  it('should return View for DICOM item', () => {
    expect(viewCreator.getItemConstructor(
      buildDatasetItemPayload({
        dataset_image: null,
        dataset_video: buildDatasetDicomPayload()
      })
    )).toBe(VideoView)
  })

  it('should return VideoView for video item', () => {
    expect(viewCreator.getItemConstructor(
      buildDatasetItemPayload({
        dataset_video: buildDatasetVideoPayload()
      })
    )).toBe(VideoView)
  })
})

it('haveSameItemConstructor should return true when both items have the same constructor', () => {
  expect(viewCreator.haveSameItemConstructor(
    buildDatasetItemPayload(),
    buildDatasetItemPayload()
  )).toBeTruthy()

  expect(viewCreator.haveSameItemConstructor(
    buildDatasetItemPayload({
      dataset_image: null,
      dataset_video: buildDatasetDicomPayload()
    }),
    buildDatasetItemPayload({
      dataset_video: buildDatasetVideoPayload({
        streamable: true
      })
    })
  )).toBeFalsy()
})

it('createDefaultView should return View instance', () => {
  expect(viewCreator.createDefaultView().constructor).toBe(View)
})

describe('createForItem', () => {
  it('should return StreamView instance for streamable video item', () => {
    expect(viewCreator.createForItem(
      buildDatasetItemPayload({
        dataset_video: buildDatasetVideoPayload({
          streamable: true
        })
      })
    ).constructor).toBe(StreamView)
  })

  it('should return View instance for item === null', () => {
    expect(viewCreator.createForItem(null).constructor).toBe(View)
  })

  it('should return View instance for image item', () => {
    expect(viewCreator.createForItem(
      buildDatasetItemPayload()
    ).constructor).toBe(View)
  })

  it('should return View instance for DICOM item', () => {
    expect(viewCreator.createForItem(
      buildDatasetItemPayload({
        dataset_image: null,
        dataset_video: buildDatasetDicomPayload()
      })
    ).constructor).toBe(VideoView)
  })

  it('should return VideoView instance for video item', () => {
    expect(viewCreator.createForItem(
      buildDatasetItemPayload({
        dataset_video: buildDatasetVideoPayload()
      })
    ).constructor).toBe(VideoView)
  })
})
