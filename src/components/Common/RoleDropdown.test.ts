import { createLocalVue, shallowMount } from '@vue/test-utils'

import { createMockTheme } from 'test/unit/components/mocks'

import { ROLE_OPTIONS } from '@/layouts/Main/SettingsDialog/Panes/TeamMembers/data'
import { MembershipRole } from '@/store/types'

import RoleDropdown from './RoleDropdown.vue'
import { RoleDropdownOption } from './RoleDropdownOption'

const localVue = createLocalVue()

let propsData: {
  id: string
  name: string
  value: MembershipRole
  disabled?: boolean
  options: RoleDropdownOption[]
}

const mocks = {
  $theme: createMockTheme()
}

beforeEach(() => {
  propsData = {
    id: 'foo',
    name: 'foo',
    value: 'annotator',
    options: ROLE_OPTIONS
  }
})

const itMatchesSnapshot = (): void => it('matches snapshot', () => {
  const wrapper = shallowMount(RoleDropdown, { localVue, mocks, propsData })
  expect(wrapper).toMatchSnapshot()
})

itMatchesSnapshot()

describe('when disabled', () => {
  beforeEach(() => {
    propsData.disabled = true
  })

  itMatchesSnapshot()

  it('renders disabled select', () => {
    const wrapper = shallowMount(RoleDropdown, { localVue, mocks, propsData })
    expect(wrapper.find('select2-stub').props('disabled')).toBe(true)
  })
})
