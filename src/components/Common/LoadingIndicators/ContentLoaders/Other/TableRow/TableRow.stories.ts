import { Meta, Story } from '@storybook/vue'

import TableRow from './TableRow.vue'

export default {
  title: 'ContentLoader/Other/TableRow'
} as Meta<typeof TableRow>

export const Default: Story = (args, { argTypes }) => ({
  components: { TableRow },
  props: Object.keys(argTypes),
  template: `
    <table-row v-bind="$props" />
  `
})

Default.storyName = 'TableRow'
Default.args = {}
