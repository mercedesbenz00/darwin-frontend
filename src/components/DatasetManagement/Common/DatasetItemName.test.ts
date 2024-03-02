import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'

import Toast from '@/plugins/ToastController'
import * as clipboard from '@/utils/clipboard'

import DatasetItemName from './DatasetItemName.vue'

jest.mock('@/utils/clipboard')

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(Toast)
localVue.directive('tooltip', stubDirectiveWithAttribute)

let store: ReturnType<typeof createTestStore>
let propsData: { name: string }

beforeEach(() => {
  store = createTestStore()
  propsData = { name: '1.jpg' }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(DatasetItemName, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('copies created key to clipboard', async () => {
  jest.spyOn(clipboard, 'copy').mockResolvedValue({})
  const wrapper = shallowMount(DatasetItemName, { localVue, propsData, store })
  await wrapper.find('.dataset-item-name').trigger('click')

  expect(clipboard.copy).toHaveBeenCalledWith('1.jpg')
})
