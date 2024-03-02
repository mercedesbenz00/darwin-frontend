import { createLocalVue, shallowMount } from '@vue/test-utils'
import VModal from 'vue-js-modal'
import Vuex from 'vuex'

import { createMockTheme } from 'test/unit/components/mocks'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import { ConfirmationDialogLayout } from 'test/unit/stubs'

import { ConfirmationDialog } from '@/components/Common/ConfirmationDialog/V2'
import { installCommonComponents } from '@/plugins/components'

const localVue = createLocalVue()
localVue.use(VModal)
localVue.use(Vuex)
localVue.directive('loading', stubDirectiveWithAttribute)
installCommonComponents(localVue)

const mocks = { $theme: createMockTheme() }
const stubs = { ConfirmationDialogLayout }

let propsData: {
  title: string
  detail: string
  buttonText: string
  name?: string
  loading?: boolean
}

const itMatchesSnapshot = () => it('matches snapshot', () => {
  const wrapper = shallowMount(ConfirmationDialog, { localVue, mocks, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

describe('with normal props', () => {
  beforeEach(() => {
    propsData = { name: 'test-dialog', title: 'Test', detail: 'Test content', buttonText: 'OK' }
  })

  itMatchesSnapshot()
})
