import { action } from '@storybook/addon-actions'
import { Meta, Story } from '@storybook/vue'
import Vue from 'vue'

import store, { resetStore } from '@/store'
import { MembershipPayload } from '@/store/types/MembershipPayload'
import { memberships, teams } from '@/storybook/fixtures'

import UserListElement from './UserListElement.vue'

export default {
  title: 'User/List Element',
  component: UserListElement,
  argTypes: {
    selected: { type: 'boolean' }
  }
} as Meta<typeof UserListElement>

const { v7 } = teams

const setupStore = (vm: Vue): void => {
  resetStore()
  const store = vm.$store
  store.commit('team/SET_CURRENT_TEAM', v7)
  store.commit('team/SET_MEMBERSHIPS', Object.values(memberships))
}

const Template: Story = (args, { argTypes }) => ({
  components: { UserListElement },
  props: Object.keys(argTypes),
  store,
  template: `
    <div style='width: 200px'>
      <user-list-element @on-click='onClick' v-bind='$props' />
    </div>
  `,
  created (): void {
    setupStore((this as unknown) as Vue)
  },
  methods: { onClick: action('onClick') }
})

export const Default = Template.bind({})
Default.args = {
  selected: false,
  member: Object.values(memberships)[0] as MembershipPayload
}
Default.storyName = 'User'
