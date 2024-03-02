import { Meta, Story } from '@storybook/vue'
import { createPinia } from 'pinia'
import { defineComponent } from 'vue'

import DatasetStageChild from '@/components/Stages/StageChilds/scenes/DatasetStageChild/DatasetStageChild.vue'
import StageTemplate from '@/components/Stages/StageTemplate.vue'
import store from '@/store'
import { StageType } from '@/store/types/StageType'
import { V2DatasetStagePayload } from '@/store/types/V2WorkflowStagePayload'
import { setupEmpty } from '@/storybook/fixtures/__mocks__/workflow/setupEmpty'
import { baseWorkflow } from '@/storybook/fixtures/__mocks__/workflow/setupMultiple'

const pinia = createPinia()

export default {
  title: 'Stages/Canvas/Dataset'
} as Meta<typeof DatasetStageChild>

type StoryProps = { stage: V2DatasetStagePayload }

export const Connected: Story<StoryProps> = (args, { argTypes }) => defineComponent({
  components: {
    DatasetStageChild,
    StageTemplate
  },
  props: Object.keys(argTypes),
  store,
  pinia,
  created (): void {
    setupEmpty()
  },
  template: `
    <div style='display:block;position:relative;width:500px;height:500px;'>
      <stage-template :stage="stage">
        <template #content>
          <dataset-stage-child :stage="stage"/>
        </template>
      </stage-template>
    </div>
  `
})

export const Disconnected: Story<StoryProps> = (args, { argTypes }) => defineComponent({
  components: {
    DatasetStageChild,
    StageTemplate
  },
  props: Object.keys(argTypes),
  store,
  pinia,
  created () {
    setupEmpty()
  },
  template: `
    <stage-template :stage="stage">
      <template #content>
        <dataset-stage-child :stage="stage" />
      </template>
    </stage-template>
  `
})

const datasetStage = 
  baseWorkflow.stages.find(s => s.type === StageType.Dataset) as V2DatasetStagePayload

Connected.args = {
  stage: datasetStage
}  

Disconnected.args = {
  stage: { ...datasetStage, config: { ...datasetStage.config, dataset_id: null }}
}
