import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'

import BrushSize from '@/components/WorkView/TopBar/ToolOptions/components/BrushSize.vue'
import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('input-auto-blur', stubDirectiveWithAttribute)

let store: ReturnType<typeof createTestStore>
let editor: Editor
let propsData: {
  editor: Editor
  value: number
  commandName: string
}

beforeEach(() => {
  store = createTestStore()
  editor = new Editor(new ItemManager(store), store)
  propsData = {
    editor,
    value: 10,
    commandName: 'brush_tool.set_brush_size'
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(BrushSize, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('only accepts numbers', async () => {
  const wrapper = shallowMount(BrushSize, { localVue, propsData, store })
  const keyboardEvent = new KeyboardEvent('keypress', { keyCode: 47 })
  jest.spyOn(keyboardEvent, 'preventDefault').mockReturnValue(undefined)
  await wrapper.find('input').element.dispatchEvent(keyboardEvent)
  expect(keyboardEvent.preventDefault).toBeCalled()
})

it('only accepts numbers greater than 0', async () => {
  const wrapper = shallowMount(BrushSize, { localVue, propsData, store })

  const inputField = wrapper.find('input') as any
  inputField.element.value = '0'
  await inputField.trigger('input')

  expect(store.dispatch).toBeCalledWith('toast/notify', { content: expect.stringContaining('greater than 0') })
})

it('set brush size of the tool', async () => {
  const wrapper = shallowMount(BrushSize, { localVue, propsData, store })

  jest.spyOn(editor, 'callCommand').mockReturnValue(undefined)

  const inputField = wrapper.find('input') as any
  inputField.element.value = '20'
  await inputField.trigger('input')

  expect(editor.callCommand).toBeCalledWith('brush_tool.set_brush_size', 20)
})
