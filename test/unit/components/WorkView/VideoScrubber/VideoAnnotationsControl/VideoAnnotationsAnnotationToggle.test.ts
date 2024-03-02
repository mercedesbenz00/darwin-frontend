import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import { buildFlaskStageVideoAnnotation } from 'test/unit/components/WorkView/VideoScrubber/utils'
import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import { buildAnnotationClassPayload, buildDatasetPayload } from 'test/unit/factories'

import VideoAnnotationsAnnotationToggle from '@/components/WorkView/VideoScrubber/VideoAnnotationsControl/VideoAnnotationsAnnotationToggle.vue'
import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('tooltip', stubDirectiveWithAttribute)

let store: ReturnType<typeof createTestStore>
let editor: Editor
let propsData: { editor: Editor }

const sfh = buildDatasetPayload({ id: 1 })
const flask = buildAnnotationClassPayload({
  id: 1,
  name: 'flask',
  annotation_types: ['polygon'],
  datasets: [{ id: sfh.id }]
})

beforeEach(() => {
  store = createTestStore()
  store.commit('aclass/SET_CLASSES', [flask])
  store.commit('workview/SET_DATASET', sfh)
  editor = new Editor(new ItemManager(store), store)
  const annotation = buildFlaskStageVideoAnnotation(editor)
  jest.spyOn(editor.activeView.annotationManager, 'annotations', 'get')
    .mockReturnValue([annotation])
  propsData = { editor }
})

it('matches snapshot', () => {
  editor.activeView.annotations[0].select(false)
  const wrapper = shallowMount(VideoAnnotationsAnnotationToggle, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when not visible', () => {
  editor.activeView.annotations[0].select(false)
  editor.activeView.annotations[0].hide(false)
  const wrapper = shallowMount(VideoAnnotationsAnnotationToggle, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('emits toggleAnnotation on click', async () => {
  editor.activeView.annotations[0].select(false)
  jest.spyOn(editor.activeView.annotations[0], 'hide').mockReturnValue(undefined)
  jest.spyOn(editor.activeView.annotations[0], 'show').mockReturnValue(undefined)

  const wrapper = shallowMount(VideoAnnotationsAnnotationToggle, { localVue, propsData, store })
  await wrapper.find('button').trigger('click')
  expect(editor.activeView.annotations[0].hide).toBeCalled()
})
