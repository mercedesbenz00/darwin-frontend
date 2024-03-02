import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import { createMockTheme } from 'test/unit/components/mocks'
import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'

import { ToolBarButton } from '@/components/WorkView/ToolBar'
import { Editor } from '@/engine/editor'
import { ItemManager, ToolManager, ToolInfo } from '@/engine/managers'

const localVue = createLocalVue()

localVue.prototype.$ga = { event () { } }

localVue.use(Vuex)
localVue.directive('tooltip', stubDirectiveWithAttribute)

const init = () => {
  const $route = { name: 'Workview' }
  const $theme = createMockTheme()
  const store = createTestStore()
  const editor = new Editor(new ItemManager(store), store)
  const toolManager = new ToolManager(editor)
  const toolInfo: ToolInfo = {
    name: 'Bounding Box',
    toolTip: 'Bounding Box',
    active: true,
    icon: 'bbox'
  }
  const propsData = { data: toolInfo, toolManager }
  const mocks = { $route, $theme }
  return { mocks, propsData, store }
}

it('matches snapshot in RESET mode', () => {
  const { mocks, propsData, store } = init()
  const wrapper = shallowMount(ToolBarButton, { localVue, mocks, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('emits click when click', () => {
  const { mocks, propsData, store } = init()
  const wrapper = shallowMount(ToolBarButton, { localVue, mocks, propsData, store })
  const button = wrapper.find('icon-button-stub')
  button.vm.$emit('click')
  expect(wrapper.emitted().click).toBeDefined()
})
