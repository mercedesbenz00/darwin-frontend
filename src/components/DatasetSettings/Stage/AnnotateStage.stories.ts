import { StageActor } from '@/components/DatasetSettings/utils'
import { memberships, workflowTemplates } from '@/storybook/fixtures'

import AnnotateStage from './AnnotateStage.vue'

const stories = {
  title: 'DatasetSettings/AnnotateStage',
  component: AnnotateStage,
  argTypes: {
    deletable: { control: 'boolean' },
    movable: { control: 'boolean' },
    hasSampling: { control: 'boolean' }
  }
}

const actors: StageActor[] = Object.values(memberships).map(member => ({
  member,
  scoreInDataset: { score: 50, mergedInstances: 6, rejectedInstances: 3 },
  scoreInTeam: { score: 70, mergedInstances: 10, rejectedInstances: 7 }
}))

export default stories

type Opts = { argTypes: typeof stories.argTypes }
type Args = Record<keyof Opts['argTypes'], any>

const stage = workflowTemplates.arc.workflow_stage_templates[0]

export const Normal = (args: Args, { argTypes }: Opts) => ({
  components: { AnnotateStage },
  props: Object.keys(argTypes),
  template: '<annotate-stage v-bind="$props" />'
})

Normal.args = { actors, stage }

export const WithSampling = (args: Args, { argTypes }: Opts) => ({
  components: { AnnotateStage },
  props: Object.keys(argTypes),
  template: '<annotate-stage v-bind="$props" />'
})

WithSampling.args = {
  actors,
  hasSampling: true,
  stage
}
