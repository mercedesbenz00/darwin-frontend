import { action } from '@storybook/addon-actions'

import { workflowTemplates } from '@/storybook/fixtures'

import CodeStage from './CodeStage.vue'

export default {
  title: 'DatasetSettings/CodeStage'
}

const stage = workflowTemplates.mmlarc.workflow_stage_templates[2]

export const Normal = () => ({
  components: { CodeStage },
  data: () => ({ stage }),
  template: '<code-stage :stage="stage" @change="onChange"/>',
  methods: {
    onChange: action('change')
  }
})

export const Deletable = () => ({
  components: { CodeStage },
  data: () => ({ stage }),
  template: '<code-stage deletable :stage="stage" @change="onChange"/>',
  methods: {
    onChange: action('change')
  }
})
