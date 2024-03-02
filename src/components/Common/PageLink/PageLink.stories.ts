import { Meta, Story } from '@storybook/vue'
import RouteMock from 'storybook-vue-router'

import PageLink from './PageLink.vue'
import { PageLinkProps } from './types'

export default {
  title: 'Common/PageLink',
  argTypes: {
    label: {
      control: 'text',
      description: 'Label to display',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '-' }
      }
    },
    href: {
      control: 'text',
      description: 'Link to redirect',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '#' }
      }
    }
  },
  decorators: [RouteMock()]
} as Meta<typeof PageLink>

export const Default: Story<PageLinkProps> = (args, { argTypes }) => ({
  components: { PageLink },
  props: Object.keys(argTypes),
  template: `
    <div style='background:#f4f5f5;width:176px;height:auto;border-radius:12px;padding:12px'>
      <page-link v-bind='$props' />
    </div>
  `
})

Default.args = {
  label: 'eagle_shelf_new_simple.mp4',
  href: '#'
}
