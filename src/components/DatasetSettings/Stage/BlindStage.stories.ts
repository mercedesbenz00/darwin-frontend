import { Story, StoryContext } from '@storybook/vue'

import { StageActor } from '@/components/DatasetSettings/utils'
import { memberships, workflowTemplates } from '@/storybook/fixtures'

import BlindStage from './BlindStage.vue'

type BlindStageArgs = {}

const stories: Partial<StoryContext> = {
  title: 'DatasetSettings/BlindStage',
  component: BlindStage,
  argTypes: {
    deletable: { name: 'Deletable', control: 'boolean' },
    movable: { name: 'Movable', control: 'boolean' },
    hasSampling: { name: 'Has Sampling', control: 'boolean' }
  }
}

const actors: StageActor[] = Object.values(memberships).map(member => ({
  member,
  scoreInDataset: { score: 50, mergedInstances: 6, rejectedInstances: 3 },
  scoreInTeam: { score: 70, mergedInstances: 10, rejectedInstances: 7 }
}))

export default stories

const stages = [
  workflowTemplates.blind.workflow_stage_templates[0],
  workflowTemplates.blind.workflow_stage_templates[1],
  workflowTemplates.blind.workflow_stage_templates[2]
]

export const Normal: Story<BlindStageArgs> = (args, { argTypes }): Object => ({
  components: { BlindStage },
  props: Object.keys(argTypes),
  template: '<blind-stage v-bind="$props" />'
})

Normal.args = { actors, stages }
