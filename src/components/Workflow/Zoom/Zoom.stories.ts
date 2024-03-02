import { action } from '@storybook/addon-actions'
import { Meta, Story } from '@storybook/vue'

import { Zoom, ZoomProps } from '.'

export default {
  title: 'Layouts/Workflow/Zoom',
  argTypes: {}
} as Meta<typeof Zoom>

export const Default: Story<ZoomProps> = (args, { argTypes }) => ({
  components: { Zoom },
  props: Object.keys(argTypes),
  methods: { onZoomIn: action('onZoomIn'), onZoomOut: action('onZoomOut') },
  template: '<zoom v-bind="$props" @on-zoom-in="onZoomIn" @on-zoom-out="onZoomOut" />'
})

Default.args = {}
