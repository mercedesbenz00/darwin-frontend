import { createLocalVue, shallowMount } from '@vue/test-utils'

import PermissionGroup from '@/components/ApiKey/PermissionGroup.vue'
import { PERMISSION_GROUPS, GROUPED_ABILITIES } from '@/components/ApiKey/data'

const localVue = createLocalVue()
localVue.directive('tooltip', () => {})

const actions = Object.values(GROUPED_ABILITIES).reduce((a, b) => a.concat(b))

PERMISSION_GROUPS.forEach(group => {
  it(`matches snapshot for ${group.name}`, () => {
    const permissions = actions
      .filter(a => GROUPED_ABILITIES[group.id].includes(a))
      .map(a => [a, 'all'])

    const propsData = { group: { ...group, permissions } }
    const wrapper = shallowMount(PermissionGroup, { localVue, propsData })
    expect(wrapper).toMatchSnapshot()
  })
})
