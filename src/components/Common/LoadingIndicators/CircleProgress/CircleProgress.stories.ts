import { Meta, Story } from '@storybook/vue'

import CircleProgress from '@/components/Common/LoadingIndicators/CircleProgress/CircleProgress.vue'

export default {
  title: 'LoadingIndicators/CircleProgress'
} as Meta<typeof CircleProgress>

export const Default: Story = (args, { argTypes }) => ({
  components: { CircleProgress },
  props: Object.keys(argTypes),
  template: `
    <div style="background-color: hsla(225, 96%, 56%, 1);width: 100%;height: 100vh;">
      <circle-progress v-bind="$props" />
    </div>`
})

Default.args = {
  progress: 50
}
