import { Meta, Story } from '@storybook/vue'

import ListElementV2 from '@/components/Common/ListElements/ListElementV2/ListElementV2.vue'
import PopupMenuV2 from '@/components/Common/PopupMenu/V2/PopupMenu.vue'

export default {
  title: 'Common/PopupMenu/Versions/V2',
  argTypes: {
    seperatorIndex: {
      control: 'number',
      description: 'Places a seperator line after specific index',
      table: {
        type: { summary: 'Number' },
        defaultValue: { summary: '-1' }
      }
    }
  }
} as Meta<typeof PopupMenuV2>

const Template: Story = (args, { argTypes }) => ({
  components: {
    PopupMenuV2,
    ListElementV2
  },
  props: Object.keys(argTypes),
  template: `
    <popup-menu-v2 v-bind='$props'>
      <list-element-v2 text='Child 1' />
      <list-element-v2 text='Child 2' :selected="true" />
      <list-element-v2 text='Child 3' />
    </popup-menu-v2>
  `
})

export const Default = Template.bind({})
Default.args = {
  seperatorIndex: 1
}

export const NoChilds: Story = (args, { argTypes }) => ({
  components: { PopupMenuV2 },
  props: Object.keys(argTypes),
  template: '<popup-menu-v2 v-bind="$props" />'
})
NoChilds.args = {}
NoChilds.storyName = 'Without Childs / Fallback'
