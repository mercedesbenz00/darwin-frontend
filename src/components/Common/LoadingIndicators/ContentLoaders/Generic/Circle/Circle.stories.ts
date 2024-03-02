import { Meta, Story } from '@storybook/vue'

import CircleContentLoader from './Circle.vue'

export default {
  title: 'ContentLoader/Generic/Circle',
  argTypes: {
    size: {
      control: 'number',
      description: 'Define a size for the circle content loader',
      table: {
        defaultValue: { summary: 20 },
        type: { summary: 'Number' }
      }
    }
  }
} as Meta<typeof CircleContentLoader>

export const Default: Story = (args, { argTypes }) => ({
  components: { CircleContentLoader },
  props: Object.keys(argTypes),
  template: `
    <circle-content-loader v-bind='$props' />
  `
})

Default.storyName = 'Circle'
Default.args = {
  size: 20
}
