import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildAnnotationClassPayload,
  buildDatasetPayload
} from 'test/unit/factories'

import Instructions from '@/components/WorkView/Instructions/Instructions.vue'
import { AnnotationClassPayload, DatasetPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let propsData: {
  annotationClasses: AnnotationClassPayload[]
  dataset: DatasetPayload
  inModal?: boolean
}
let mocks: {
  $can: () => boolean,
  $ga: { event: () => void }
}

beforeEach(() => {
  store = createTestStore()
  propsData = {
    annotationClasses: [
      buildAnnotationClassPayload({ id: 2 })
    ],
    dataset: buildDatasetPayload({ annotation_hotkeys: { 1: 'select_class:2' } })
  }
  mocks = {
    $can: (): boolean => true,
    $ga: { event: (): void => {} }
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(Instructions, { localVue, mocks, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot in modal mode', () => {
  propsData.inModal = true
  const wrapper = shallowMount(Instructions, { localVue, mocks, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when you are able to create a new class', () => {
  mocks.$can = (): boolean => false
  const wrapper = shallowMount(Instructions, { localVue, mocks, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('open instructions', async () => {
  jest.spyOn(store, 'commit').mockReturnValue(undefined)
  const wrapper = shallowMount(Instructions, { localVue, mocks, propsData, store })
  await wrapper.find('.instructions__full-description-link').trigger('click')
  expect(store.commit).toBeCalledWith('workview/OPEN_INSTRUCTIONS')
})

it('emits add-class when add class button is clicked', async () => {
  const wrapper = shallowMount(Instructions, { localVue, mocks, propsData, store })
  expect(wrapper.find('instructions-list-create-item-stub').exists()).toBeTruthy()
  await wrapper.find('instructions-list-create-item-stub').vm.$emit('click')
  expect(wrapper.emitted()['add-class']).toBeDefined()
})
