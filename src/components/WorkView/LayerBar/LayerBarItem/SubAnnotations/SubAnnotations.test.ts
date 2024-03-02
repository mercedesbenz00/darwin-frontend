import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import { createTestStore, setDefaultAnnotationTypes } from 'test/unit/createTestStore'
import {
  buildAnnotationClassPayload,
  buildMeasureRegionsPayload,
  buildStageAnnotation
} from 'test/unit/factories'

import SubAnnotations from '@/components/WorkView/LayerBar/LayerBarItem/SubAnnotations/SubAnnotations.vue'
import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'
import { StageAnnotation } from '@/store/modules/workview/types'
import { AnnotationClassPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let editor: Editor
let stageAnnotation: StageAnnotation
let annotationClass: AnnotationClassPayload
let propsData: {
  annotation: StageAnnotation
  annotationClass: AnnotationClassPayload
  editor: Editor
  readonly?: boolean
}

beforeEach(() => {
  store = createTestStore()
  setDefaultAnnotationTypes(store)
  annotationClass = buildAnnotationClassPayload({
    id: 1,
    team_id: 1,
    name: 'Flask',
    metadata: { _color: 'rgba(4,4,4,0.5)' },
    description: '',
    annotation_types: ['polygon', 'attributes', 'directional_vector', 'instance_id', 'text']
  })
  stageAnnotation = buildStageAnnotation({
    annotation_class_id: annotationClass.id
  })
  editor = new Editor(new ItemManager(store), store)
  propsData = {
    annotation: stageAnnotation,
    annotationClass,
    editor
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(SubAnnotations, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
  expect(wrapper.findAll('.sub-annotations__item')).toHaveLength(4)
})

it('matches snapshot when readonly', () => {
  propsData.readonly = true
  const wrapper = shallowMount(SubAnnotations, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
  expect(wrapper.findAll('.sub-annotations__item')).toHaveLength(4)
})

const itMatchesSnapshot = (): void => it('matches snapshot', () => {
  const wrapper = shallowMount(SubAnnotations, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

const itRendersSubAnnotations = (): void => it('renders subannotations', () => {
  const wrapper = shallowMount(SubAnnotations, { localVue, propsData, store })
  expect(wrapper.findAll('.sub-annotations__item')).toHaveLength(4)
})

const itDoesNotRenderSubAnnotations = (): void => it('does not render subannotations', () => {
  const wrapper = shallowMount(SubAnnotations, { localVue, propsData, store })
  expect(wrapper.findAll('.sub-annotations__item')).toHaveLength(0)
})

// store.state.workview.renderSubAnnotations has logic which determines the default
// since the mutation is a toggle, these helper functions ensure it's toggled correctly

const enableSubAnnotations = (store: ReturnType<typeof createTestStore>): void => {
  if (store.state.workview.renderSubAnnotations) { return }
  store.commit('workview/TOGGLE_SUBANNOTATIONS')
}

const disableSubAnnotations = (store: ReturnType<typeof createTestStore>): void => {
  if (store.state.workview.renderSubAnnotations) {
    store.commit('workview/TOGGLE_SUBANNOTATIONS')
  }
}

describe('when selected', () => {
  beforeEach(() => {
    propsData.annotation.isSelected = true
  })

  describe('when subannotations off', () => {
    beforeEach(() => {
      disableSubAnnotations(store)
    })

    itMatchesSnapshot()
    itRendersSubAnnotations()
  })

  describe('when subannotations on', () => {
    beforeEach(() => {
      enableSubAnnotations(store)
    })

    itMatchesSnapshot()
    itRendersSubAnnotations()
  })
})

describe('when not selected', () => {
  beforeEach(() => {
    propsData.annotation.isSelected = false
  })

  describe('when subannotations off', () => {
    beforeEach(() => {
      disableSubAnnotations(store)
    })

    itMatchesSnapshot()
    itDoesNotRenderSubAnnotations()
  })

  describe('when subannotations on', () => {
    beforeEach(() => {
      enableSubAnnotations(store)
    })

    itMatchesSnapshot()
    itRendersSubAnnotations()
  })
})

it('matches snapshot with measures', () => {
  store.commit('workview/TOGGLE_MEASURES')
  jest.spyOn(editor, 'measureRegion', 'get').mockReturnValue(buildMeasureRegionsPayload())
  editor.activeView.measureManager.measureOverlayDataEntries = {
    1: {
      id: stageAnnotation.id!,
      color: 'rgba(0, 0, 0, 0.1)',
      label: 'Measure label',
      measures: []
    }
  }
  const wrapper = shallowMount(SubAnnotations, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
  expect(wrapper.findAll('.sub-annotations__item')).toHaveLength(5)
})
