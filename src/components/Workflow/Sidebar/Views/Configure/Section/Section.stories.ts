import { Meta, Story } from '@storybook/vue'

import SidebarConfigureSection from './Section.vue'
import { SidebarConfigureSectionTypes } from './types'

export default {
  title: 'Layouts/Workflow/Sidebar/Configure',
  argTypes: {
    backgroundColor: {
      control: 'color',
      description: 'Defines the childs background color',
      table: {
        type: { summary: 'String' },
        defaultValue: { summary: '#FFFFFF' }
      }
    },
    label: {
      control: 'text',
      description: 'The title of the section',
      table: {
        type: { summary: 'String' },
        defaultValue: { summary: 'Default Section Title' }
      }
    }
  }
} as Meta<typeof SidebarConfigureSection>

export const Default: Story<SidebarConfigureSectionTypes> = (args, { argTypes }) => ({
  components: { SidebarConfigureSection },
  props: Object.keys(argTypes),
  template: `
    <div style='position: fixed;
                top: 0px;
                left: 0px;
                right: 0px;
                bottom: 0px;
                margin: auto;
                width: 340px;
                height: 500px;
                background: transparent;'>
      <sidebar-configure-section v-bind="$props">
        <h1>I am a child</h1>
      </sidebar-configure-section>
    </div>
  `
})
Default.args = {
  backgroundColor: '#FFFFFF',
  label: 'Default Section Title'
}
Default.storyName = 'Section Template'
