import { Meta, Story } from '@storybook/vue'

import Thumbnails from './Thumbnails.vue'

export default {
  title: 'Common/Thumbnails'
} as Meta<typeof Thumbnails>

const Template: Story = (args, { argTypes }) => ({
  components: { Thumbnails },
  props: Object.keys(argTypes),
  template: '<div style="width: 160px"><thumbnails v-bind="$props" /></div>'
})

const AltTemplate: Story = (args, { argTypes }) => ({
  components: { Thumbnails },
  props: Object.keys(argTypes),
  template: '<div style="width: 88px"><thumbnails v-bind="$props" /></div>'
})

export const Default = Template.bind({})
Default.args = {
  data: [
    'https://via.placeholder.com/150/92c952',
    'https://via.placeholder.com/150/92c952',
    'https://via.placeholder.com/150/92c952',
    'https://via.placeholder.com/150/92c952'
  ],
  max: 3
}

export const Local = Template.bind({})
Local.args = {
  data: [
    '/static/test.png',
    '/static/test.png',
    '/static/test.png',
    '/static/test.png'
  ],
  max: 4
}

export const Mini = AltTemplate.bind({})
Mini.args = {
  data: [
    '/static/test.png',
    '/static/test.png',
    '/static/test.png',
    '/static/test.png'
  ],
  variant: 'mini',
  max: 3
}

export const Large = Template.bind({})
Large.args = {
  data: [
    '/static/test.png',
    '/static/test.png',
    '/static/test.png',
    '/static/test.png'
  ],
  variant: 'big',
  max: 4
}

export const Empty = Template.bind({})
Empty.args = {
  data: []
}
