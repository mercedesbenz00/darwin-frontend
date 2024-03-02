import { action } from '@storybook/addon-actions'
import { Meta, Story } from '@storybook/vue'

import { IconDuotoneViewFolder } from '@/assets/icons/V2/Duotone'
import { IconMonoChevron } from '@/assets/icons/V2/Mono'

import FilterListElement from './FilterListElement.vue'

export default {
  title: 'Common/ListElements/FilterListElement'
} as Meta<typeof FilterListElement>

export const Default: Story = (args, { argTypes }) => ({
  components: {
    FilterListElement,
    IconDuotoneViewFolder,
    IconMonoChevron
  },
  props: Object.keys(argTypes),
  methods: { onFilter: action('on-filter') },
  template: `
    <div style='width: 177px;'>
      <filter-list-element v-bind='$props' @on-filter='onFilter'>
        <template #prefixIcon>
          <icon-duotone-view-folder />
        </template>
        <template #suffixIcon>
          <icon-mono-chevron />
        </template>
      </filter-list-element>
    </div>
  `
})

Default.storyName = 'FilterListElement'
Default.args = {
  status: 'positive',
  meta: {
    id: '1',
    count: 32,
    label: 'Test'
  }
}
