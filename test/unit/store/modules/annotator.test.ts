import { createLocalVue } from '@vue/test-utils'
import { cloneDeep } from 'lodash'
import Vuex from 'vuex'

import { buildDatasetPayload } from 'test/unit/factories'

import annotator from '@/store/modules/annotator'
import { RootState } from '@/store/types'

jest.mock('@/utils/index')

const localVue = createLocalVue()
localVue.use(Vuex)

const newStore = () => {
  const store = new Vuex.Store<RootState>({
    modules: {
      annotator: { ...annotator, state: cloneDeep(annotator.state) }
    }
  })

  return store
}

const sfhDataset = buildDatasetPayload({ id: 1, name: 'sfh' })
const birdsDataset = buildDatasetPayload({ id: 2, name: 'birds' })

describe('annotator/SET_DATASETS', () => {
  it('replaces all datasets in state', () => {
    const store = newStore()
    expect(store.state.annotator.datasets).toEqual([])

    store.commit('annotator/SET_DATASETS', [sfhDataset])
    expect(store.state.annotator.datasets).toEqual([sfhDataset])

    store.commit('annotator/SET_DATASETS', [birdsDataset])
    expect(store.state.annotator.datasets).toEqual([birdsDataset])

    store.commit('annotator/SET_DATASETS', [sfhDataset, birdsDataset])
    expect(store.state.annotator.datasets).toEqual([sfhDataset, birdsDataset])
  })

  it('keeps expanded dataset data for existing datasets', () => {
    const store = newStore()
    expect(store.state.annotator.datasets).toEqual([])

    const expandedBirdsDataset = { ...birdsDataset, instructions: 'foo', unassigned_image_count: 5 }

    store.commit('annotator/SET_DATASETS', [sfhDataset, expandedBirdsDataset])
    expect(store.state.annotator.datasets).toEqual([sfhDataset, expandedBirdsDataset])

    store.commit('annotator/SET_DATASETS', [sfhDataset, birdsDataset])
    expect(store.state.annotator.datasets).toEqual([sfhDataset, expandedBirdsDataset])
  })
})

describe('annotator/PUSH_DATASET', () => {
  it('adds new dataset to state', () => {
    const store = newStore()
    expect(store.state.annotator.datasets).toEqual([])

    store.commit('annotator/PUSH_DATASET', sfhDataset)
    expect(store.state.annotator.datasets).toEqual([sfhDataset])

    store.commit('annotator/PUSH_DATASET', birdsDataset)
    expect(store.state.annotator.datasets).toEqual([sfhDataset, birdsDataset])
  })

  it('replaces existing dataset in state', () => {
    const store = newStore()

    store.commit('annotator/PUSH_DATASET', birdsDataset)
    expect(store.state.annotator.datasets).toEqual([birdsDataset])

    const updatedBirds = { ...birdsDataset, name: 'updated birds' }
    store.commit('annotator/PUSH_DATASET', updatedBirds)
    expect(store.state.annotator.datasets).toEqual([updatedBirds])
  })
})
