import { action } from '@storybook/addon-actions'
import { Meta, Story } from '@storybook/vue'

import { DatasetItemStatus } from '@/store/types/DatasetItemStatus'

import StatusFilter from './StatusFilter.vue'

export default {
  title: 'DatasetFiltering/StatusFilter'
} as Meta<typeof StatusFilter>

export const Default: Story = (args, { argTypes }) => ({
  components: { StatusFilter },
  props: Object.keys(argTypes),
  methods: { onOption: action('on-option') },
  template: `
    <div style='width:260px'>
      <status-filter v-bind="$props" @on-option='onOption' />
    </div>
  `
})

Default.storyName = 'StatusFilter'
Default.args = {
  options: Object.entries(DatasetItemStatus).map((value) => {
    return {
      id: value[1],
      label: value[1].charAt(0).toUpperCase() + value[1].slice(1),
      count: 1
    }
  }),
  counts: {
    commented_item_count: 1,
    item_count: 1,
    unfiltered_item_count: 1
  }
}
