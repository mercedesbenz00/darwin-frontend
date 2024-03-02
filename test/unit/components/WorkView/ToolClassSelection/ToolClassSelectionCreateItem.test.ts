import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildAnnotationTypePayload } from 'test/unit/factories'

import ToolClassSelectionCreateItem from '@/components/WorkView/ToolClassSelection/ToolClassSelectionCreateItem.vue'

const localVue = createLocalVue()
localVue.directive('close-popover', () => {})
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

const boundingBox = buildAnnotationTypePayload({ id: 2, name: 'bounding_box', granularity: 'main' })

beforeEach(() => {
  store = createTestStore()
  store.commit('workview/SET_TOOL_ANNOTATION_TYPES', [boundingBox])
})

it('matches snapshot', () => {
  const wrapper = shallowMount(ToolClassSelectionCreateItem, { localVue, store })
  expect(wrapper).toMatchSnapshot()
})
