import { shallowMount, createLocalVue, Wrapper } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildDatasetItemFilter, buildDatasetItemsCountPayload, buildMembershipPayload, buildTeamPayload } from 'test/unit/factories'

import WorkflowFilterDisplay from '@/components/WorkView/WorkflowFilter/WorkflowFilterDisplay.vue'
import { DatasetItemStatus, MembershipPayload } from '@/store/types'
import { getFullName } from '@/utils'

const localVue = createLocalVue()
localVue.use(Vuex)

let wrapper: Wrapper<Vue>
let store: ReturnType<typeof createTestStore>
let members: MembershipPayload[]

const currentTeam = buildTeamPayload({ id: 1 })

const setupMembers = () => [
  buildMembershipPayload({ id: 1, team_id: 1, user_id: 11, first_name: 'Sam', last_name: 'Annotator' }),
  buildMembershipPayload({ id: 2, team_id: 1, user_id: 22, first_name: 'Jim', last_name: 'Annotator' }),
  buildMembershipPayload({ id: 3, team_id: 1, user_id: 33, first_name: 'Joe', last_name: 'Member' }),
  buildMembershipPayload({ id: 4, team_id: 2, user_id: 33, first_name: 'Jake', last_name: 'OtherTeam' })
]

beforeEach(() => {
  store = createTestStore()
  members = setupMembers()
  store.commit('team/SET_MEMBERSHIPS', members)
  store.commit('team/SET_CURRENT_TEAM', currentTeam)
  store.commit('workview/SET_DATASET_ITEMS_FILTER', buildDatasetItemFilter())
  store.commit('workview/SET_DATASET_ITEM_COUNTS', buildDatasetItemsCountPayload({ item_count: 10 }))

  wrapper = shallowMount(WorkflowFilterDisplay, { localVue, store })
})

it('matches snapshot', () => {
  expect(wrapper).toMatchSnapshot()
})

it('emits toggle-expand', async () => {
  await wrapper.trigger('click')
  expect(wrapper.emitted()['toggle-expand']).toHaveLength(1)
})

it('emits deselect-all', async () => {
  store.commit('workview/SET_DATASET_ITEMS_FILTER', { assignees: [members[0].user_id] })
  await wrapper.vm.$nextTick()

  const clearSelection = wrapper.find('.workflow-filter-display__clear-selection')
  expect(clearSelection.exists()).toBeTruthy()
  await clearSelection.trigger('click')
  expect(wrapper.emitted()['deselect-all']).toHaveLength(1)
})

describe('member selection', () => {
  it('matches snapshot', async () => {
    expect(wrapper).toMatchSnapshot('no one selected')

    store.commit('workview/SET_DATASET_ITEMS_FILTER', { assignees: [members[0].user_id] })
    await wrapper.vm.$nextTick()
    expect(wrapper).toMatchSnapshot('one member selected')
  })
})

describe('status selection', () => {
  it('matches snapshot', async () => {
    expect(wrapper).toMatchSnapshot('no status selected')

    store.commit(
      'workview/SET_DATASET_ITEMS_FILTER',
      { statuses: [DatasetItemStatus.new, DatasetItemStatus.annotate] }
    )
    await wrapper.vm.$nextTick()

    expect(wrapper).toMatchSnapshot('new, annotate selected')
  })
})

describe('template selection', () => {
  it('matches snapshot', async () => {
    expect(wrapper).toMatchSnapshot('no template selected')

    store.commit(
      'workview/SET_DATASET_ITEMS_FILTER',
      { workflow_stage_template_ids: [55] }
    )
    await wrapper.vm.$nextTick()

    expect(wrapper).toMatchSnapshot('first template selected')
  })
})

describe('main area selection rendering', () => {
  let label: Wrapper<Vue>

  beforeEach(() => {
    label = wrapper.find('.workflow-filter-display__label')
  })

  const expectSigmaIcon = (wrapper: Wrapper<Vue>) =>
    expect(wrapper.find('sigma-icon-stub').exists()).toBe(true)

  const expectFunnelIcon = (wrapper: Wrapper<Vue>) =>
    expect(wrapper.find('funnel-icon-stub').exists()).toBe(true)

  const expectStatusIcon = (wrapper: Wrapper<Vue>) =>
    expect(wrapper.find('status-button-stub').exists()).toBe(true)

  describe('no statuses selected', () => {
    const statuses: DatasetItemStatus[] = []

    describe('no members selected', () => {
      const assignees: number[] = []

      beforeEach(async () => {
        store.commit('workview/SET_DATASET_ITEMS_FILTER', { statuses, assignees })
        await wrapper.vm.$nextTick()
      })

      it('renders "all" as label', () => expect(label.text()).toEqual('all'))
      it('renders sigma icon', () => expectSigmaIcon(wrapper))
    })

    describe('one member selected', () => {
      let assignees: number[]

      beforeEach(async () => {
        assignees = [members[0].user_id]
        store.commit('workview/SET_DATASET_ITEMS_FILTER', { statuses, assignees })
        await wrapper.vm.$nextTick()
      })

      it('renders member full name  as label', () => {
        expect(label.text()).toEqual(getFullName(members[0]))
      })

      it('renders funnel icon', () => expectFunnelIcon(wrapper))
    })

    describe('multiple members selected', () => {
      let assignees: number[]

      beforeEach(async () => {
        assignees = [members[0].user_id, members[1].user_id]
        store.commit('workview/SET_DATASET_ITEMS_FILTER', { statuses, assignees })
        await wrapper.vm.$nextTick()
      })

      it('renders "filtered"  as label', () => expect(label.text()).toEqual('filtered'))
      it('renders funnel icon', () => expectFunnelIcon(wrapper))
    })

    describe('all members selected', () => {
      let assignees: number[]

      beforeEach(async () => {
        assignees = members.map(m => m.user_id)
        store.commit('workview/SET_DATASET_ITEMS_FILTER', { statuses, assignees })
        await wrapper.vm.$nextTick()
      })

      it('renders "all"  as label', () => expect(label.text()).toEqual('all'))
      it('renders sigma icon', () => expectSigmaIcon(wrapper))
    })
  })

  describe('one status selected', () => {
    const statuses = [DatasetItemStatus.new]

    describe('no members selected', () => {
      const assignees: number[] = []

      beforeEach(async () => {
        store.commit('workview/SET_DATASET_ITEMS_FILTER', { statuses, assignees })
        await wrapper.vm.$nextTick()
      })

      it('renders status as label', () => expect(label.text()).toEqual('new'))
      it('renders status icon', () => expectStatusIcon(wrapper))
    })

    describe('one member selected', () => {
      let assignees: number[]

      beforeEach(async () => {
        assignees = [members[0].user_id]
        store.commit('workview/SET_DATASET_ITEMS_FILTER', { statuses, assignees })
        await wrapper.vm.$nextTick()
      })

      it('renders "filtered"  as label', () => expect(label.text()).toEqual('filtered'))
      it('renders funnel icon', () => expectFunnelIcon(wrapper))
    })

    describe('multiple members selected', () => {
      let assignees: number[]

      beforeEach(async () => {
        assignees = [members[0].user_id, members[1].user_id]
        store.commit('workview/SET_DATASET_ITEMS_FILTER', { statuses, assignees })
        await wrapper.vm.$nextTick()
      })

      it('renders "filtered"  as label', () => expect(label.text()).toEqual('filtered'))
      it('renders funnel icon', () => expectFunnelIcon(wrapper))
    })

    describe('all members selected', () => {
      let assignees: number[]

      beforeEach(async () => {
        assignees = members.map(m => m.user_id)
        store.commit('workview/SET_DATASET_ITEMS_FILTER', { statuses, assignees })
        await wrapper.vm.$nextTick()
      })

      it('renders status name  as label', () => expect(label.text()).toEqual('new'))
      it('renders status icon', () => expectStatusIcon(wrapper))
    })
  })

  describe('multiple statuses selected', () => {
    const statuses = [DatasetItemStatus.new, DatasetItemStatus.annotate]

    describe('no members selected', () => {
      const assignees: number[] = []

      beforeEach(async () => {
        store.commit('workview/SET_DATASET_ITEMS_FILTER', { statuses, assignees })
        await wrapper.vm.$nextTick()
      })

      it('renders "filtered" as label', () => expect(label.text()).toEqual('filtered'))
      it('renders funnel icon', () => expectFunnelIcon(wrapper))
    })

    describe('one member selected', () => {
      let assignees: number[]

      beforeEach(async () => {
        assignees = [members[0].user_id]
        store.commit('workview/SET_DATASET_ITEMS_FILTER', { statuses, assignees })
        await wrapper.vm.$nextTick()
      })

      it('renders "filtered" as label', () => expect(label.text()).toEqual('filtered'))
      it('renders funnel icon', () => expectFunnelIcon(wrapper))
    })

    describe('multiple members selected', () => {
      let assignees: number[]

      beforeEach(async () => {
        assignees = [members[0].user_id, members[1].user_id]
        store.commit('workview/SET_DATASET_ITEMS_FILTER', { statuses, assignees })
        await wrapper.vm.$nextTick()
      })

      it('renders "filtered"  as label', () => expect(label.text()).toEqual('filtered'))
      it('renders funnel icon', () => expectFunnelIcon(wrapper))
    })

    describe('all members selected', () => {
      let assignees: number[]

      beforeEach(async () => {
        assignees = members.map(m => m.user_id)
        store.commit('workview/SET_DATASET_ITEMS_FILTER', { statuses, assignees })
        await wrapper.vm.$nextTick()
      })

      it('renders "filtered"  as label', () => expect(label.text()).toEqual('filtered'))
      it('renders funnel icon', () => expectFunnelIcon(wrapper))
    })
  })

  describe('all statuses selected', () => {
    const statuses = [
      DatasetItemStatus.new,
      DatasetItemStatus.annotate,
      DatasetItemStatus.review,
      DatasetItemStatus.complete
    ]

    describe('no members selected', () => {
      const assignees: number[] = []

      beforeEach(async () => {
        store.commit('workview/SET_DATASET_ITEMS_FILTER', { statuses, assignees })
        await wrapper.vm.$nextTick()
      })

      it('renders "all" as label', () => expect(label.text()).toEqual('all'))
      it('renders sigma icon', () => expectSigmaIcon(wrapper))
    })

    describe('one member selected', () => {
      let assignees: number[]

      beforeEach(async () => {
        assignees = [members[0].user_id]
        store.commit('workview/SET_DATASET_ITEMS_FILTER', { statuses, assignees })
        await wrapper.vm.$nextTick()
      })

      it('renders member full name as label', () => {
        expect(label.text()).toEqual(getFullName(members[0]))
      })
      it('renders funnel icon', () => expectFunnelIcon(wrapper))
    })

    describe('multiple members selected', () => {
      let assignees: number[]

      beforeEach(async () => {
        assignees = [members[0].user_id, members[1].user_id]
        store.commit('workview/SET_DATASET_ITEMS_FILTER', { statuses, assignees })
        await wrapper.vm.$nextTick()
      })

      it('renders "filtered"  as label', () => expect(label.text()).toEqual('filtered'))
      it('renders funnel icon', () => expectFunnelIcon(wrapper))
    })

    describe('all members selected', () => {
      let assignees: number[]

      beforeEach(async () => {
        assignees = members.map(m => m.user_id)
        store.commit('workview/SET_DATASET_ITEMS_FILTER', { statuses, assignees })
        await wrapper.vm.$nextTick()
      })

      it('renders "all"  as label', () => expect(label.text()).toEqual('all'))
      it('renders sigma icon', () => expectSigmaIcon(wrapper))
    })
  })
})
