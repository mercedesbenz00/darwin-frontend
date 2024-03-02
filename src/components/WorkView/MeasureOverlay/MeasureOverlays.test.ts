import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildMeasureRegionsPayload } from 'test/unit/factories'

import MeasureOverlays from '@/components/WorkView/MeasureOverlay/MeasureOverlays.vue'
import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'
import { View } from '@/engine/models'

const localVue = createLocalVue()
localVue.use(Vuex)

let editor: Editor
let propsData: { view: View }
let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
  editor = new Editor(new ItemManager(store), store)
  propsData = { view: editor.activeView }
})

it('renders nothing when renderMeasures is false', () => {
  const wrapper = shallowMount(MeasureOverlays, { localVue, propsData, store })
  expect(wrapper.html()).toEqual('')
})

it('renders nothing when measureRegion is null', () => {
  store.commit('workview/TOGGLE_MEASURES')
  jest.spyOn(editor, 'measureRegion', 'get').mockReturnValue(null)
  const wrapper = shallowMount(MeasureOverlays, { localVue, propsData, store })
  expect(wrapper.html()).toEqual('')
})

it('matches snapshot', () => {
  store.commit('workview/TOGGLE_MEASURES')
  jest
    .spyOn(editor.activeView, 'measureRegion', 'get')
    .mockReturnValue(buildMeasureRegionsPayload())
  editor.activeView.measureManager.measureOverlayDataEntries = {
    'annotation-1': {
      id: 'annotation-1',
      color: 'rgba(0, 0, 0, 0.1)',
      label: '',
      measures: []
    },
    'annotation-2': {
      id: 'annotation-2',
      color: 'rgba(0, 0, 0, 0.1)',
      label: '',
      measures: []
    }
  }
  const wrapper = shallowMount(MeasureOverlays, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})
