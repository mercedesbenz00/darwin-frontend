import { action } from '@storybook/addon-actions'
import { Story, StoryContext } from '@storybook/vue'

import { workflowTemplates } from '@/storybook/fixtures'

import TestStage from './TestStage.vue'

const context: Partial<StoryContext> = {
  title: 'DatasetSettings/TestStage'
}

export default context

const stage = workflowTemplates.blind.workflow_stage_templates[1]

export const Normal: Story = () => ({
  components: { TestStage },
  data: (): Object => ({ stage }),
  template: '<test-stage :stage="stage" @change="onChange"/>',
  methods: {
    onChange: action('change')
  }
})

export const Deletable: Story = () => ({
  components: { TestStage },
  data: (): Object => ({ stage }),
  template: '<test-stage deletable :stage="stage" @change="onChange"/>',
  methods: {
    onChange: action('change')
  }
})
