import { createLocalVue, shallowMount } from '@vue/test-utils'

import { buildAdminTeamPayload } from 'test/unit/factories'

import TeamNameColumn from '@/components/Admin/TeamList/TeamNameColumn.vue'
import { TeamPayload } from '@/store/modules/admin/types'

const localVue = createLocalVue()
const v7 = buildAdminTeamPayload({ id: 7, managed_status: 'regular' })
const v7Partner = buildAdminTeamPayload({ id: 7, managed_status: 'partner' })

const stubs = ['router-link']

let propsData: { team: TeamPayload }

const itMatchesSnapshot = () => it('matches snapshot', () => {
  const wrapper = shallowMount(TeamNameColumn, { localVue, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

describe('when regular team', () => {
  beforeEach(() => {
    propsData = { team: v7 }
  })

  itMatchesSnapshot()
})

describe('when partner team', () => {
  beforeEach(() => {
    propsData = { team: v7Partner }
  })

  itMatchesSnapshot()
})
