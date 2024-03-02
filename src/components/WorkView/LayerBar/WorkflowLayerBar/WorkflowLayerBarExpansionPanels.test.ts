import { createLocalVue, shallowMount } from '@vue/test-utils'
import * as uuid from 'uuid'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

import { ExpansionPanels } from '@/components/Common/ExpansionPanels'
import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'

import WorkflowLayerBarExpansionPanels from './WorkflowLayerBarExpansionPanels.vue'

const localVue = createLocalVue()

localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

let propsData: {
  editor: Editor,
  viewsStageAnnotations: Array<any>
}

const stubs = {
  ExpansionPanel: true,
  ExpansionPanels
}

jest.mock('uuid')
let counter = 0
jest.spyOn(uuid, 'v4').mockImplementation(() =>
  `fake-id-${counter++}`
)

beforeEach(() => {
  counter = 0
  store = createTestStore()

  const editor = new Editor(new ItemManager(store), store)
  editor.setupLayout({
    type: 'horizontal',
    views: [{
      item: null,
      framesGroup: [0]
    }, {
      item: null,
      framesGroup: [1]
    }]
  })

  propsData = {
    editor,
    viewsStageAnnotations: editor.viewsList.map(view => ({
      stageAnnotations: [],
      view
    }))
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(
    WorkflowLayerBarExpansionPanels,
    { localVue, stubs, store, propsData }
  )
  expect(wrapper).toMatchSnapshot()
})
