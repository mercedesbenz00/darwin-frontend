import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildAnnotationClassPayload } from 'test/unit/factories'

import DirectionalVectorItem from '@/components/WorkView/LayerBar/LayerBarItem/SubAnnotations/DirectionalVectorItem.vue'
import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'
import { DirectionalVector } from '@/engine/plugins/directionalVector/types'
import { StageAnnotation } from '@/store/modules/workview/types'
import { AnnotationClassPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let editor: Editor
let stageAnnotation: StageAnnotation
let propsData: {
  annotation: StageAnnotation
  annotationClass: AnnotationClassPayload
  data: DirectionalVector
  editor: Editor
  readonly?: boolean
}

beforeEach(() => {
  store = createTestStore()
  const annotationClass = buildAnnotationClassPayload({ id: 1 })
  editor = new Editor(new ItemManager(store), store)
  propsData = {
    annotation: stageAnnotation,
    annotationClass,
    data: { angle: Math.PI, length: 100.1111 },
    editor
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(DirectionalVectorItem, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when readonly', () => {
  propsData.readonly = true
  const wrapper = shallowMount(DirectionalVectorItem, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})
