import { action } from '@storybook/addon-actions'
import { Meta, Story } from '@storybook/vue'
import { createPinia } from 'pinia'
import { defineComponent } from 'vue'

import {
  IconColoredAnnotate,
  IconColoredComplete,
  IconColoredDataset,
  IconColoredReview
} from '@/assets/icons/V2/Colored'
import AnnotateStageChild from '@/components/Stages/StageChilds/scenes/AnnotateStageChild/AnnotateStageChild.vue'
import ReviewStageChild from '@/components/Stages/StageChilds/scenes/ReviewStageChild/ReviewStageChild.vue'
import store from '@/store'
import { StageType } from '@/store/types/StageType'
import { baseWorkflow, setupMultiple } from '@/storybook/fixtures/__mocks__/workflow/setupMultiple'

import StageTemplate from './StageTemplate.vue'

export default {
  title: 'Stages/Canvas',
  component: StageTemplate,
  argTypes: {
    selected: {
      control: 'boolean',
      description: 'Toggles selected state of component',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' }
      }
    },
    stage: {
      description: 'Data which comes from the workflowSceneStore'
    }
  }
} as Meta<typeof StageTemplate>

const pinia = createPinia()

const Template: Story = (args, { argTypes }) => defineComponent({
  components: {
    StageTemplate,
    AnnotateStageChild,
    IconColoredAnnotate,
    IconColoredComplete,
    IconColoredDataset,
    IconColoredReview,
    ReviewStageChild
  },
  props: Object.keys(argTypes),
  store,
  pinia,
  created (): void {
    setupMultiple({ x: 0, y: 0 })
  },
  methods: {
    onMenu: action('onMenu'),
    onDrag: action('onDrag')
  },
  template: `
    <div style='width:6000px;height:500px;position:relative;display:block' id="layout-container">
      <stage-template @on-menu='onMenu' @on-drag='onDrag' v-bind='$props'>
        <template #icon>
          <component :is="'icon-colored-' + stage.type" />
        </template>
        <template #content>
          <component 
            :stage='stage' 
            :is="stage.type === 'complete' ? undefined : stage.type+'-stage-child'" />
        </template>
      </stage-template>
    </div>
  `
})

const annotateStage = baseWorkflow.stages.find(s => s.type === StageType.Annotate)
export const Annotate = Template.bind({})
Annotate.args = { stage: annotateStage, selected: false }

const reviewStage = baseWorkflow.stages.find(s => s.type === StageType.Review)
export const Review = Template.bind({})
Review.args = { stage: reviewStage, selected: false }

const completeStage = baseWorkflow.stages.find(s => s.type === StageType.Complete)
export const Complete = Template.bind({})
Complete.args = { stage: completeStage, selected: false }
