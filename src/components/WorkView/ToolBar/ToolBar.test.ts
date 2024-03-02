import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import { createMockTheme } from 'test/unit/components/mocks'
import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'

import ToolBar from '@/components/WorkView/ToolBar/ToolBar.vue'
import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'

const localVue = createLocalVue()

localVue.prototype.$ga = { event () { } }

localVue.use(Vuex)
localVue.directive('tooltip', stubDirectiveWithAttribute)

let store: ReturnType<typeof createTestStore>
let propsData: { editor: Editor }
let mocks: {
  $theme: ReturnType<typeof createMockTheme>
}

beforeEach(() => {
  store = createTestStore()
  const editor = new Editor(new ItemManager(store), store)
  propsData = { editor }
  mocks = {
    $theme: createMockTheme()
  }
})

describe('darwin', () => {
  beforeEach(() => { mocks.$theme = createMockTheme() })

  it('matches snapshot', () => {
    const wrapper = shallowMount(ToolBar, { localVue, mocks, propsData, store })
    expect(wrapper).toMatchSnapshot()
  })

  it('scale to fit when you click on scale button', () => {
    const wrapper = shallowMount(ToolBar, { localVue, mocks, propsData, store })
    propsData.editor.scaleToFit = jest.fn()
    const component = wrapper.find('tool-bar-zoom-controls-stub')
    component.vm.$emit('scale-to-fit')
    expect(component.exists()).toBe(true)
    expect(propsData.editor.scaleToFit).toBeCalled()
  })

  describe('in /tutorial', () => {
    beforeEach(() => store.commit('workview/SET_TUTORIAL_MODE', true))

    it('matches snapshot', () => {
      const wrapper = shallowMount(ToolBar, { localVue, mocks, propsData, store })
      expect(wrapper).toMatchSnapshot()
    })
  })
})
