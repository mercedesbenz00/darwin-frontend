import { shallowMount, createLocalVue, Stubs } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildAdminTeamPayload } from 'test/unit/factories/buildAdminTeamPayload'

import TeamList from '@/components/Admin/TeamList.vue'
import { dateFromUtcISO } from '@/utils'

const localVue = createLocalVue()

localVue.use(Vuex)

// custom client table stub, so the wrapper renders all the given slots
// if more columns with custom slots are added, they should be added here to
// once vue test utils supports rendering named slots in shallow mount,
// which is on the roadmap, we can remove this
const Table = localVue.extend({
  props: { columns: Array, data: Array, options: Object },
  template: `
    <div class="rows">
      <div v-for="row in data">
        <div class="team"><slot name="team" :row="row"/></div>
        <div class="creationDate"><slot name="creation_date" :row="row"/></div>
        <div class="credits"><slot name="credits" :row="row"/></div>
        <div class="creditRunningOutAt"><slot name="credit_running_out_at" :row="row"/></div>
        <div class="owner"><slot name="owner" :row="row"/></div>
        <div class="creditNextExpiry"><slot name="credit_next_expiry" :row="row"/></div>
        <div class="creditFurthestExpiry"><slot name="credit_furthest_expiry" :row="row"/></div>
        <div class="storage"><slot name="storage" :row="row"/></div>
        <div class="stripe"><slot name="stripe" :row="row"/></div>
        <div class="invoice"><slot name="invoice" :row="row"/></div>
        <div class="expanded-area"><slot name="child_row" :row="row"/></div>
      </div>
    </div>
  `
})

const stubs: Stubs = { 'text-area': true, 'router-link': true, 'v-table': Table }

const teams = [
  buildAdminTeamPayload({
    creation_date: '2019-12-30T20:27:23',
    credit_furthest_expiry: '2030-11-30T20:21:22',
    credit_next_expiry: '2055-06-30T20:21:22',
    credit_running_out_at: '2030-09-30T20:21:22',
    dataset_count: 2,
    id: 1,
    name: 'V7',
    owner_email: 'user_name@v7labs.com',
    owner_first_name: 'User',
    owner_last_name: 'Name',
    slug: 'v7',
    subscription_period_end: dateFromUtcISO('2025-08-02T11:22:33').getTime() / 1000,
    subscription_period_start: dateFromUtcISO('2025-07-02T11:22:33').getTime() / 1000,
    user_count: 4
  }),

  buildAdminTeamPayload({
    creation_date: '2019-12-30T20:27:23',
    dataset_count: 2,
    id: 2,
    name: 'V8',
    owner_email: 'user_name@v7labs.com',
    owner_first_name: 'User',
    owner_last_name: 'Name',
    slug: 'v8',
    note: 'Random V8 note',
    subscription_period_end: dateFromUtcISO('2032-02-02T11:22:33').getTime() / 1000,
    subscription_period_start: dateFromUtcISO('2032-01-02T11:22:33').getTime() / 1000,
    user_count: 4
  })
]

it('matches snapshot', () => {
  const store = createTestStore()
  store.commit('admin/SET_TEAMS', teams)
  const wrapper = shallowMount(TeamList, { localVue, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when team list is empty', () => {
  const store = createTestStore()
  const wrapper = shallowMount(TeamList, { localVue, store, stubs })
  expect(wrapper).toMatchSnapshot()
})
