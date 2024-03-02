import { createLocalVue, shallowMount } from '@vue/test-utils'

import { Table } from '@/components/Common/Table/V1'

const localVue = createLocalVue()

it('matches snapshot', () => {
  const wrapper = shallowMount(Table, {
    localVue,
    propsData: {
      columns: ['id', 'name'],
      data: []
    }
  })
  expect(wrapper).toMatchSnapshot()
})
