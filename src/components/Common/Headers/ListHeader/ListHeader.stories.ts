import { Meta, Story } from '@storybook/vue'

import { IconMonoChevron } from '@/assets/icons/V2/Mono'

import ListHeader from './ListHeader.vue'
import { ListHeaderSize, ListHeaderVariant } from './types'

export default {
  title: 'Common/Headers/ListHeader',
  argTypes: {
    size: {
      control: {
        type: 'select'
      },
      options: Object.entries(ListHeaderSize).map((val) => val[1]),
      description: "Changes spacing depending on what size you'll pass",
      table: {
        type: { summary: 'ListHeaderSize' },
        defaultValue: { summary: 'ListHeaderSize.SM' }
      }
    },
    variant: {
      control: {
        type: 'select'
      },
      options: Object.entries(ListHeaderVariant).map((val) => val[1]),
      description: "Changes appearance depending on what variant you'll pass",
      table: {
        type: { summary: 'ListHeaderVariant' },
        defaultValue: { summary: 'ListHeaderVariant.TRANSPARENT' }
      }
    },
    label: {
      control: 'text',
      description: 'Label to display'
    },
    showIcon: {
      control: 'boolean',
      description: 'Toggles Icon, Storybook prop only. Not part of the component',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' }
      }
    }
  }
} as Meta<typeof ListHeader>

export const Default: Story = (args, { argTypes }) => ({
  components: { ListHeader, IconMonoChevron },
  props: Object.keys(argTypes),
  template: `
    <div style='width: 224px'>
      <list-header v-bind="$props">
        <icon-mono-chevron v-if='$props.showIcon' />
      </list-header>
    </div>
  `
})

Default.storyName = 'ListHeader'
Default.args = {
  size: ListHeaderSize.SM,
  variant: ListHeaderVariant.ELEVATE,
  label: 'Default label',
  // Storybook prop only. Not part of the component
  showIcon: true
}
