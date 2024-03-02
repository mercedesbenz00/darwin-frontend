import { action } from '@storybook/addon-actions'
import { Meta, Story } from '@storybook/vue'
import Vue from 'vue'

import {
  IconColoredAnnotate as AnnotateStageIcon,
  IconColoredComplete as CompleteStageIcon,
  IconColoredReview as ReviewStageIcon
} from '@/assets/icons/V2/Colored'
import store, { resetStore } from '@/store'
import { StageType } from '@/store/types/StageType'
import { workflowBuilder } from '@/storybook/fixtures/__mocks__/workflow/workflow'

import StageSidebarTemplate from './StageSidebarTemplate.vue'
import { StageSidebarTemplateProps } from './types'

export default {
  title: 'Stages/Sidebar/Stage',
  component: StageSidebarTemplate
} as Meta<typeof StageSidebarTemplate>

const setupStore = (vm: Vue): void => {
  resetStore()
  const store = vm.$store
  store.commit('v2Workflow/SET_WORKFLOW', workflowBuilder())
}

const Template: Story<StageSidebarTemplateProps> = (args, { argTypes }) => ({
  components: {
    StageSidebarTemplate,
    ReviewStageIcon,
    AnnotateStageIcon,
    CompleteStageIcon
  },
  props: Object.keys(argTypes),
  methods: {
    onDrag: action('onDrag'),
    onDragEnd: action('onDragEnd')
  },
  store,
  created (): void {
    setupStore((this as unknown) as Vue)
  },
  template: `
    <div style='display: block; width: 300px; height: fit-content'>
      <stage-sidebar-template v-bind='$props' @on-drag='onDrag' @on-drag-end='onDragEnd'>
        <template #icon>
          <component :is="$props.type+'-stage-icon'" />
        </template>
      </stage-sidebar-template>
    </div>
  `
})

export const Annotate = Template.bind({})
Annotate.args = {
  type: StageType.Annotate
}

export const Review = Template.bind({})
Review.args = {
  type: StageType.Review
}

export const Complete = Template.bind({})
Complete.args = {
  type: StageType.Complete
}
