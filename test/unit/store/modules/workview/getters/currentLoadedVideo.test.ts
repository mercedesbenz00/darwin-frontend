import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildDatasetItemPayload, buildLoadedVideo } from 'test/unit/factories'

import { currentLoadedVideo } from '@/store/modules/workview/getters/currentLoadedVideo'
import { WorkviewState } from '@/store/modules/workview/state'
import { LoadedVideo } from '@/store/modules/workview/types'
import { RootState } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let state: WorkviewState
const getters = {}
let rootState: RootState
const rootGetters = {}

beforeEach(() => {
  const store = createTestStore()
  state = store.state.workview
  rootState = store.state
})

let loadedVideo: LoadedVideo

describe('currentLoadedVideo', () => {
  beforeEach(() => {
    loadedVideo = buildLoadedVideo({ id: 2 })
  })

  describe('selectedDatasetItem is video item', () => {
    beforeEach(() => {
      state.selectedDatasetItem = buildDatasetItemPayload({
        id: 1,
        dataset_video_id: loadedVideo.id
      })
    })

    describe('loadedVideo is found', () => {
      beforeEach(() => {
        state.loadedVideos = [loadedVideo]
      })

      it('should return current loaded video', () => {
        const data = currentLoadedVideo(state, getters, rootState, rootGetters)
        expect(data).toEqual(loadedVideo)
      })
    })

    describe('loadedVideo is not found', () => {
      beforeEach(() => {
        state.loadedVideos = [buildLoadedVideo({ id: 1 })]
      })

      it('should return null', () => {
        const data = currentLoadedVideo(state, getters, rootState, rootGetters)
        expect(data).toBeNull()
      })
    })
  })

  describe('selectedDatasetItem is not video item', () => {
    beforeEach(() => {
      state.selectedDatasetItem = buildDatasetItemPayload({ id: 1 })
    })

    it('should return null', () => {
      const data = currentLoadedVideo(state, getters, rootState, rootGetters)
      expect(data).toBeNull()
    })
  })

  describe('selectedVideoItem is not defined', () => {
    beforeEach(() => {
      state.selectedDatasetItem = null
    })

    it('should return null', () => {
      const data = currentLoadedVideo(state, getters, rootState, rootGetters)
      expect(data).toBeNull()
    })
  })
})
