import Vue from 'vue'

import { slider } from '@/storybook/controls/slider'

import UsageLimiter from './UsageLimiter.vue'

const stories = {
  component: UsageLimiter,
  title: 'Billing/Plans/UsageLimiter',
  argTypes: {
    clientLimit: slider(0, 1000, 1),
    partnerLimit: slider(0, 1000, 1)
  }
}

export default stories

type StoryConfig = { argTypes: typeof stories.argTypes }
type Args = Record<keyof typeof stories.argTypes, any>

export const Default = (args: Args, { argTypes }: StoryConfig) => Vue.extend({
  components: { UsageLimiter },
  props: Object.keys(argTypes),
  computed: {
    limit () {
      return this.clientLimit
    },
    parentLimit () {
      return this.partnerLimit
    }
  },
  template: '<usage-limiter :limit="limit" :parent-limit="parentLimit" />'
})

Default.args = {
  clientLimit: 500,
  partnerLimit: 500
}
