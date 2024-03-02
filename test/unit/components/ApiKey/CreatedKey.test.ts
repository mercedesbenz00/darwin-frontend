import { createLocalVue, shallowMount } from '@vue/test-utils'

import CreatedKey from '@/components/ApiKey/CreatedKey.vue'

const localVue = createLocalVue()

it('matches snapshot', () => {
  const propsData = { value: 'foo.fake-key' }
  const wrapper = shallowMount(CreatedKey, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})
