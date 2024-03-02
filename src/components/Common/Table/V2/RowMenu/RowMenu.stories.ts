import { Meta, Story } from '@storybook/vue'

import RowMenu from './RowMenu.vue'

export default {
  title: 'Common/Table/V2/RowMenu'
} as Meta<typeof RowMenu>

export const Default: Story = (args, { argTypes }) => ({
  components: { RowMenu },
  props: Object.keys(argTypes),
  template: `
    <div style="display:grid;grid-gap:12px;">
      <row-menu :is-item="false" />
      <row-menu />
    </div>
  `
})

Default.storyName = 'RowMenu'
Default.args = {}
