import { Meta, Story } from '@storybook/vue'

import RectContentLoader from './Rect.vue'

export default {
  title: 'ContentLoader/Generic/Rect',
  argTypes: {
    width: {
      control: 'number',
      description: 'Define a width for the rect content loader',
      table: {
        defaultValue: { summary: 34 },
        type: { summary: 'Number' }
      }
    },
    height: {
      control: 'number',
      description: 'Define a height for the rect content loader',
      table: {
        defaultValue: { summary: 28 },
        type: { summary: 'Number' }
      }
    }
  }
} as Meta<typeof RectContentLoader>

export const Default: Story = (args, { argTypes }) => ({
  components: { RectContentLoader },
  props: Object.keys(argTypes),
  template: `
    <rect-content-loader :dimensions='{ width: $props.width, height: $props.height }' />
  `
})

Default.storyName = 'Rect'
Default.args = {
  width: 34,
  height: 28
}
