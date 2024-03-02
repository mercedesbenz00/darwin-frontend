import { action } from '@storybook/addon-actions'

import { StageActor } from '@/components/DatasetSettings/utils'
import { memberships, workflowTemplates } from '@/storybook/fixtures'

import ReviewStage from './ReviewStage.vue'

const stories = {
  title: 'DatasetSettings/ReviewStage',
  component: ReviewStage,
  argTypes: {
    deletable: { control: 'boolean' },
    movable: { control: 'boolean' },
    hasSampling: { control: 'boolean' },
    stage: { control: 'object' },
    actors: { control: 'array' }
  }
}

const actors: StageActor[] = Object.values(memberships).map(member => ({
  member,
  scoreInDataset: { score: 50, mergedInstances: 6, rejectedInstances: 3 },
  scoreInTeam: { score: 70, mergedInstances: 10, rejectedInstances: 7 }
}))

const listeners = () => ({ listeners: { change: action('change') } })

export default stories

type Opts = { argTypes: typeof stories.argTypes }
type Args = Record<keyof Opts['argTypes'], any>

const stage = workflowTemplates.arc.workflow_stage_templates[1]

export const Normal = (args: Args, { argTypes }: Opts) => ({
  components: { ReviewStage },
  data () { return listeners() },
  props: Object.keys(argTypes),
  template: '<review-stage v-bind="$props" v-on="listeners" />'
})

Normal.args = { actors, deletable: false, stage }

export const WithSampling = (args: Args, { argTypes }: Opts) => ({
  components: { ReviewStage },
  data () { return listeners() },
  props: Object.keys(argTypes),
  template: '<review-stage v-bind="$props" v-on="listeners" />'
})

WithSampling.args = {
  actors,
  deletable: false,
  hasSampling: true,
  stage
}
