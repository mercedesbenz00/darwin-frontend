import { Meta, Story } from '@storybook/vue'
import RouteMock from 'storybook-vue-router'
import Vue from 'vue'

import { BreadCrumb } from '@/mixins/BreadCrumbInitializer'
import store, { resetStore } from '@/store'

import BreadCrumbs from './BreadCrumbs.vue'

export default {
  title: 'Common/BreadCrumbs/V2',
  argTypes: {},
  decorators: [RouteMock()]
} as Meta<typeof BreadCrumbs>

const breadCrumbs: BreadCrumb[] = [
  { to: '/workflows', name: 'Workflows' },
  { name: 'Sample Workflow' }
]

const setupStore = (vm: Vue): void => {
  resetStore()
  const store = vm.$store
  store.dispatch('ui/setBreadCrumbs', breadCrumbs)
}

export const Default: Story = (args, { argTypes }) => ({
  components: { BreadCrumbs },
  props: Object.keys(argTypes),
  store,
  template: '<bread-crumbs v-bind="$props" />',
  mounted (): void {
    setupStore((this as unknown) as Vue)
  }
})

Default.args = {}
