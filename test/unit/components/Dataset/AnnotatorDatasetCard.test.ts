import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import VModal from 'vue-js-modal'
import VueLazyload from 'vue-lazyload'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import { buildDatasetPayload, buildDatasetItemPayload, buildDatasetImagePayload, buildAnnotationClassPayload } from 'test/unit/factories'

import AnnotatorDatasetCard from '@/components/Dataset/AnnotatorDatasetCard.vue'
import { installCommonComponents } from '@/plugins/components'
import { DatasetPayload } from '@/store/types'

const localVue = createLocalVue()

localVue.use(VueLazyload)
localVue.use(Vuex)
localVue.directive('tooltip', stubDirectiveWithAttribute)
localVue.use(VModal)
installCommonComponents(localVue)

const dataset = buildDatasetPayload({ id: 1 })
const classes = [
  buildAnnotationClassPayload({ id: 1, datasets: [{ id: dataset.id }] }),
  buildAnnotationClassPayload({ id: 2, datasets: [{ id: dataset.id }] }),
  buildAnnotationClassPayload({ id: 3 })
]
let store: ReturnType<typeof createTestStore>
let propsData: { dataset: DatasetPayload }
let mocks: { $router: { push: Function } }

beforeEach(() => {
  store = createTestStore()
  mocks = { $router: { push: jest.fn() } }
  store.commit('aclass/SET_CLASSES', classes)
  propsData = { dataset }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(AnnotatorDatasetCard, { localVue, mocks, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it("doesn't route to workview on button click if no stages exist", async () => {
  const wrapper = shallowMount(AnnotatorDatasetCard, { localVue, mocks, propsData, store })
  await wrapper.find('.button__assigned').vm.$emit('click')
  expect(mocks.$router.push)
    .not.toHaveBeenCalledWith(`/workview?dataset=${propsData.dataset.id}`)
})

it('routes to workview on button click if stages exist', async () => {
  const { dataset } = propsData
  const datasetImage = buildDatasetImagePayload({ dataset_id: dataset.id, id: 1, seq: 5 })

  const item = buildDatasetItemPayload({
    dataset_id: dataset.id, dataset_image_id: 1, dataset_image: datasetImage, seq: 5
  })

  store.commit('annotator/PUSH_ITEMS', [item])

  const wrapper = shallowMount(AnnotatorDatasetCard, { localVue, mocks, propsData, store })

  await wrapper.find('.button__assigned').vm.$emit('click')
  expect(mocks.$router.push)
    .toHaveBeenCalledWith(`/workview?dataset=${propsData.dataset.id}`)
})

it('does not request more work on button click when assigned stages exist', () => {
  const { dataset } = propsData
  const datasetImage = buildDatasetImagePayload({ dataset_id: dataset.id, id: 1, seq: 5 })

  const item = buildDatasetItemPayload({
    dataset_id: dataset.id, dataset_image_id: 1, dataset_image: datasetImage, seq: 5
  })

  store.commit('annotator/PUSH_ITEMS', [item])

  const wrapper = shallowMount(AnnotatorDatasetCard, { localVue, mocks, propsData, store })
  expect(wrapper.find('.button__request-work').attributes('disabled')).toBe('true')
})

describe('requesting more work', () => {
  beforeEach(() => {
    jest.spyOn(store, 'dispatch').mockResolvedValue({ data: [] })
  })

  it('requests more work on button click', async () => {
    const wrapper = shallowMount(AnnotatorDatasetCard, { localVue, mocks, propsData, store })
    await wrapper.find('.button__request-work').vm.$emit('click')
    expect(store.dispatch).toHaveBeenCalledWith('annotator/requestWork', propsData.dataset)
  })

  it('disables button while work is being requested', async () => {
    const wrapper = shallowMount(AnnotatorDatasetCard, { localVue, mocks, propsData, store })

    expect(wrapper.find('.button__request-work').attributes('disabled')).toBeUndefined()

    await wrapper.find('.button__request-work').vm.$emit('click')
    expect(wrapper.find('.button__request-work').attributes('disabled')).toBe('true')

    await flushPromises()
    expect(wrapper.find('.button__request-work').attributes('disabled')).toBeUndefined()
  })
})

/* it('opens instructions on button click', async () => {
  const wrapper = shallowMount(AnnotatorDatasetCard, { localVue, mocks, propsData, store })
  await wrapper.find('.annotator-dataset-card__instruction-button positive-button-stub').vm.$emit('click')
  expect(store.dispatch).toHaveBeenCalledWith('annotator/loadDataset', propsData.dataset)
}) */

it('loads dataset items and stages when mounted', () => {
  shallowMount(AnnotatorDatasetCard, { localVue, mocks, propsData, store })
  expect(store.dispatch).toHaveBeenCalledWith('annotator/loadDatasetItems', propsData.dataset)
})
