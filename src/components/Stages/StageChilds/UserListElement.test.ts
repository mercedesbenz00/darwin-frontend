import { shallowMount, Wrapper } from '@vue/test-utils'

import { buildMembershipPayload } from 'test/unit/factories'

import UserListElement from './UserListElement.vue'

const propsDataMember = {
  member: buildMembershipPayload({
    id: 1,
    first_name: 'Louis',
    last_name: 'Raetz',
    user_id: 2
  }),
  amount: 0,
  selected: false
}

let wrapper: Wrapper<Vue>

beforeEach(() => {
  wrapper = shallowMount(UserListElement, {
    propsData: propsDataMember
  })
})

afterEach(() => {
  wrapper.destroy()
})

describe('User List Element', function () {
  it('should match snapshot', () => {
    expect(wrapper).toMatchSnapshot()
  })

  it('should get mounted', () => {
    expect(wrapper.exists()).toBeTruthy()
  })

  it('should display correct member name', () => {
    expect(wrapper.text()).toBe('Louis Raetz')
  })
})
