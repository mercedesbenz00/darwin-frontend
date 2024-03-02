import { Meta, Story } from '@storybook/vue'

import { IconDuotoneViewFolder } from '@/assets/icons/V2/Duotone'

import IconToggle from './IconToggle.vue'

export default {
  title: 'Common/IconToggle',
  argTypes: {
    active: {
      control: 'boolean'
    }
  }
} as Meta<typeof IconToggle>

export const Default: Story = (args, { argTypes }) => ({
  components: { IconToggle, IconDuotoneViewFolder },
  props: Object.keys(argTypes),
  template: `
    <icon-toggle v-bind="$props">
      <icon-duotone-view-folder />
    </icon-toggle>
  `
})

Default.storyName = 'IconToggle'
Default.args = {
  active: false
}
