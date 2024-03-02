import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import VueLazyload from 'vue-lazyload'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildAnnotationClassPayload, buildDatasetPayload } from 'test/unit/factories'

import InstructionClasses from '@/components/DatasetCreate/Instructions/InstructionClasses.vue'
import { DatasetPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VueLazyload)

const stubs: Stubs = ['instruction-class']

let store: ReturnType<typeof createTestStore>
const dataset: DatasetPayload = buildDatasetPayload({ id: 1 })
let propsData: {
  dataset: DatasetPayload
}

beforeEach(() => {
  store = createTestStore()
  store.commit('aclass/SET_CLASSES', [
    buildAnnotationClassPayload({ id: 1, datasets: [{ id: dataset.id }] }),
    buildAnnotationClassPayload({ id: 2, datasets: [{ id: dataset.id }] })
  ])
  propsData = { dataset }
})

it('matches the snapshot', () => {
  const wrapper = shallowMount(InstructionClasses, { localVue, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})
