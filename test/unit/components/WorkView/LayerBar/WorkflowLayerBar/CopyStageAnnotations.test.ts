import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { initializeARWorkflow } from 'test/unit/factories/helpers'
import { outOfSubscribedStorageError } from 'test/unit/fixtures/errors'

import CopyStageAnnotations from '@/components/WorkView/LayerBar/WorkflowLayerBar/CopyStageAnnotations.vue'
import { installCommonComponents } from '@/plugins/components'

const localVue = createLocalVue()
localVue.use(Vuex)
installCommonComponents(localVue)

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
})

const itMatchesSnapshot = () => {
  it('matches snapshot', () => {
    const wrapper = shallowMount(CopyStageAnnotations, { localVue, store })
    expect(wrapper).toMatchSnapshot()
  })
}

itMatchesSnapshot()

it('matches snapshot when busy', async () => {
  const wrapper = shallowMount(CopyStageAnnotations, { localVue, store })
  wrapper.setData({ busy: true })
  await wrapper.vm.$nextTick()
  expect(wrapper).toMatchSnapshot()
})

describe('with predecessor and selected item having workflows', () => {
  beforeEach(() => {
    const item1 = initializeARWorkflow({ id: 5, seq: 1 })
    const item2 = initializeARWorkflow({ id: 6, seq: 2 })
    store.commit('workview/PUSH_DATASET_ITEMS', [item1, item2])
    store.commit('workview/SET_SELECTED_DATASET_ITEM', item2)
  })

  itMatchesSnapshot()

  it('dispatches actions', async () => {
    const wrapper = shallowMount(CopyStageAnnotations, { localVue, store })

    const [item1, item2] = store.state.workview.datasetItems
    const fromStage = item1.current_workflow!.stages[1][0]
    const toStage = item2.current_workflow!.stages[1][0]

    const dispatch = store.dispatch as jest.Mock
    dispatch.mockResolvedValue({ data: toStage })
    await wrapper.vm.$nextTick()

    await wrapper.find('secondary-button-stub').vm.$emit('click')

    expect(store.dispatch).toHaveBeenCalledWith('workview/resolveStageForSelectedItem')
    await flushPromises()
    expect(store.dispatch).toHaveBeenCalledWith(
      'workview/copyStageAnnotations',
      { fromStage, toStage }
    )
  })

  it('dispatches toast on resolve stage error', async () => {
    const wrapper = shallowMount(CopyStageAnnotations, { localVue, store })

    const dispatch = store.dispatch as jest.Mock
    dispatch.mockImplementation((action) => {
      if (action === 'workview/resolveStageForSelectedItem') {
        return { error: { message: 'Fake error' } }
      }
      return { data: {} }
    })

    await wrapper.find('secondary-button-stub').vm.$emit('click')

    expect(store.dispatch).toHaveBeenCalledWith('workview/resolveStageForSelectedItem')
    await flushPromises()
    expect(store.dispatch).not.toHaveBeenCalledWith(
      'workview/copyStageAnnotations',
      expect.anything()
    )
    expect(store.dispatch).toHaveBeenCalledWith('toast/warning', { content: 'Fake error' })
  })

  it(`opens storage modal when ${outOfSubscribedStorageError.code}`, async () => {
    const dispatch = store.dispatch as jest.Mock
    dispatch.mockImplementation((action) => {
      if (action === 'workview/resolveStageForSelectedItem') {
        return { error: outOfSubscribedStorageError }
      }
      return { data: {} }
    })

    const wrapper = shallowMount(CopyStageAnnotations, { localVue, store })
    await wrapper.find('secondary-button-stub').vm.$emit('click')
    await flushPromises()
    expect(store.state.billing.outOfStorageDialogShown).toBe(true)
  })

  it('dispatches toast on copy error', async () => {
    const wrapper = shallowMount(CopyStageAnnotations, { localVue, store })

    const dispatch = store.dispatch as jest.Mock
    const [, item2] = store.state.workview.datasetItems
    const toStage = item2.current_workflow!.stages[1][0]

    dispatch.mockImplementation((action) => {
      if (action === 'workview/resolveStageForSelectedItem') {
        return { data: toStage }
      }

      if (action === 'workview/copyStageAnnotations') {
        return { error: { message: 'Fake error' } }
      }
    })

    await wrapper.find('secondary-button-stub').vm.$emit('click')

    expect(store.dispatch).toHaveBeenCalledWith('workview/resolveStageForSelectedItem')
    await flushPromises()
    expect(store.dispatch).toHaveBeenCalledWith('workview/copyStageAnnotations', expect.anything())
    expect(store.dispatch).toHaveBeenCalledWith('toast/warning', { content: 'Fake error' })
  })
})
