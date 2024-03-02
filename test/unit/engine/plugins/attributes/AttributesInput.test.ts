import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import { buildAnnotation } from 'test/unit/factories'

import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'
import { Annotation } from '@/engine/models'
import AttributesInput from '@/engine/plugins/attributes/AttributesInput.vue'
import { InputTag } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('click-outside', stubDirectiveWithAttribute)

let store: ReturnType<typeof createTestStore>
let editor: Editor

let componentData: () => ({
  editor: Editor,
  masterAnnotation: Annotation | null,
  tags: InputTag[]
})

beforeEach(() => {
  store = createTestStore()

  editor = new Editor(new ItemManager(store), store)

  componentData = () => ({
    editor,
    masterAnnotation: buildAnnotation(editor, { classId: 1 }),
    tags: []
  })
})

it('matches snapshot', () => {
  const wrapper = shallowMount(AttributesInput, { localVue, data: componentData, store })
  expect(wrapper).toMatchSnapshot()
})
