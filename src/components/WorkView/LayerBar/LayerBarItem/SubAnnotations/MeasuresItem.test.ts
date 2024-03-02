import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildMeasureRegionsPayload,
  buildStageAnnotation
} from 'test/unit/factories'

import MeasuresItem from '@/components/WorkView/LayerBar/LayerBarItem/SubAnnotations/MeasuresItem.vue'
import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'
import { StageAnnotation } from '@/store/modules/workview/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let editor: Editor
let stageAnnotation: StageAnnotation
let propsData: {
  annotation: StageAnnotation;
  editor: Editor;
  readonly?: boolean
}

beforeEach(() => {
  store = createTestStore()
  editor = new Editor(new ItemManager(store), store)
  stageAnnotation = buildStageAnnotation({ id: '1' })
  propsData = {
    annotation: stageAnnotation,
    editor
  }
})

it('renders nothing when measures is off', () => {
  const wrapper = shallowMount(MeasuresItem, { localVue, propsData, store })
  expect(wrapper.html()).toEqual('')
})

describe('when measures is on', () => {
  beforeEach(() => {
    store.commit('workview/TOGGLE_MEASURES')
    jest
      .spyOn(editor, 'measureRegion', 'get')
      .mockReturnValue(buildMeasureRegionsPayload())
    editor.activeView.measureManager.measureOverlayDataEntries = {
      1: {
        id: stageAnnotation.id!,
        color: 'rgba(0, 0, 0, 0.1)',
        label: 'Measure label',
        measures: []
      }
    }
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(MeasuresItem, { localVue, propsData, store })
    expect(wrapper).toMatchSnapshot()
  })

  it('matches snapshot when readonly', () => {
    propsData.readonly = true
    const wrapper = shallowMount(MeasuresItem, { localVue, propsData, store })
    expect(wrapper).toMatchSnapshot()
  })
})
