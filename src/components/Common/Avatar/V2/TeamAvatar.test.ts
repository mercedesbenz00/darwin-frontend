import { createLocalVue, shallowMount } from '@vue/test-utils'
import VueLazyload from 'vue-lazyload'

import { createMockTheme } from 'test/unit/components/mocks'
import { buildImagePayload, buildTeamPayload } from 'test/unit/factories'

import TeamAvatar from '@/components/Common/Avatar/V1/TeamAvatar.vue'
import { TeamPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(VueLazyload)

const mocks = { $theme: createMockTheme() }

let propsData: {
  team: TeamPayload
}

beforeEach(() => {
  propsData = {
    team: buildTeamPayload({ id: 7, name: 'My Team' })
  }
})

const itMatchesSnapshot = () => it('matches snapshot', () => {
  const wrapper = shallowMount(TeamAvatar, { localVue, mocks, propsData })
  expect(wrapper).toMatchSnapshot()
})

describe('when team has no image', () => {
  itMatchesSnapshot()
})

describe('when team has image', () => {
  beforeEach(() => {
    propsData.team.image = buildImagePayload({ url: 'original.png', thumbnail_url: 'thumb.png' })
  })

  itMatchesSnapshot()
})
