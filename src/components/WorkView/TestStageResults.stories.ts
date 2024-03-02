import { Story, StoryContext } from '@storybook/vue'

import TestStageResults from '@/components/WorkView/TestStageResults.vue'
import store from '@/store'
import {
  DatasetItemPayload,
  DatasetItemStatus,
  StageType,
  WorkflowStagePayload
} from '@/store/types'
import { baseItem } from '@/storybook/fixtures/datasetItems'
import { jamesDoe, janeDoe, johnDoe } from '@/storybook/fixtures/memberships'
import { v7 } from '@/storybook/fixtures/teams'

const stories: Partial<StoryContext> = {
  title: 'Workview/TestStageResults'
}

const blind1: WorkflowStagePayload = {
  id: 1,
  assignee_id: johnDoe.user_id,
  type: StageType.Annotate,
  metadata: {},
  template_metadata: { parallel: 2 },
  dataset_item_id: 1,
  number: 1,
  completed: false,
  completes_at: null,
  workflow_id: 11,
  skipped: false,
  skipped_reason: null,
  workflow_stage_template_id: 1111
}

const blind2: WorkflowStagePayload = { ...blind1, assignee_id: jamesDoe.user_id }

const test: WorkflowStagePayload = {
  ...blind2,
  type: StageType.Test,
  number: 2,
  template_metadata: { type_thresholds: {} }
}

const review: WorkflowStagePayload = {
  ...blind2,
  type: StageType.Review,
  template_metadata: { readonly: true },
  number: 3
}
const complete: WorkflowStagePayload = { ...blind2, type: StageType.Complete, number: 4 }

const itemInReviewStageAfterBlindStage: DatasetItemPayload = {
  ...baseItem,
  id: 1,
  seq: 1,
  current_workflow: {
    dataset_item_id: 1,
    workflow_template_id: 10,
    id: 11,
    current_workflow_stage_template_id: 1111,
    current_stage_number: 3,
    status: DatasetItemStatus.review,
    stages: {
      1: [blind1, blind2],
      2: [test],
      3: [review],
      4: [complete]
    }
  }
}

export const Default: Story = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { TestStageResults },
  template: '<test-stage-results v-bind="$props" />',
  store: store,
  created (): void {
    const store = (this as unknown as Vue).$store
    store.commit('team/SET_MEMBERSHIPS', [johnDoe, jamesDoe, janeDoe])
    store.commit('team/SET_CURRENT_TEAM', v7)
    store.commit('workview/SET_SELECTED_DATASET_ITEM', itemInReviewStageAfterBlindStage)
    store.commit('workview/SET_SELECTED_STAGE_INSTANCE', review)
  },
  beforeDestroy (): void {
    const store = (this as unknown as Vue).$store

    store.commit('team/RESET_ALL')
    store.commit('workview/RESET_ALL')
  }
})

export default stories
