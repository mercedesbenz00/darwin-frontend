import { Meta, Story } from '@storybook/vue'

import { buildRunningSessionPayload } from 'test/unit/factories'

import ModelCard from './ModelCard.vue'

export default {
  title: 'Common/ModelCard'
} as Meta<typeof ModelCard>

const Template: Story = (args, { argTypes }) => ({
  components: { ModelCard },
  props: Object.keys(argTypes),
  template: '<model-card :model="model" />'
})
const model = buildRunningSessionPayload()

export const Default: Story = Template.bind({})
Default.args = {
  model
}
