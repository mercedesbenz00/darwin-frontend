import { Meta, Story } from '@storybook/vue'
import Vue from 'vue'

import store, { resetStore } from '@/store'
import { workflowBuilder } from '@/storybook/fixtures/__mocks__/workflow/workflow'

import Workflow from './Workflow.vue'

export default {
  title: 'Layouts/Workflow',
  component: Workflow
} as Meta<typeof Workflow>

const setupStore = (vm: Vue): void => {
  resetStore()
  const store = vm.$store
  store.commit('v2Workflow/SET_WORKFLOW', workflowBuilder())
}

export const BaseLayout: Story = (args, { argTypes }) => ({
  components: { Workflow },
  props: Object.keys(argTypes),
  store,
  created (): void {
    setupStore((this as unknown) as Vue)
  },
  template: `
    <div style="height: calc(100vh - 32px)">
      <workflow v-bind="$props" />
    </div>
  `
})
