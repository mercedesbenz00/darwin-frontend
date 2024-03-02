/* eslint camelcase: "off" */

import { Story } from '@storybook/vue'
import RouteMock from 'storybook-vue-router'
import Vue from 'vue'

import store from '@/store'
import { V2WorkflowDatasetPayload, V2WorkflowPayload } from '@/store/types'

import AnnotatorsWorkflowCard from './AnnotatorsWorkflowCard.vue'

const argTypes = {
  assigned_items: { control: 'number' },
  dataset: { control: 'boolean' },
  dataset_id: { control: 'number' },
  dataset_name: { control: 'text' },
  instructions: { control: 'text' },
  name: { control: 'text' },
  thumbnails: { control: 'object' }
}

const stories = {
  title: 'Workflow/AnnotatorsWorkflowCard',
  component: AnnotatorsWorkflowCard,
  argTypes,
  decorators: [RouteMock()]
}

export default stories

type DatasetArgs = {
  dataset: boolean
  dataset_id: number
  dataset_name: string
  instructions: string
}
type WorkflowArgs =
  Pick<V2WorkflowPayload, 'assigned_items' | 'name' | 'thumbnails'>
type Workflow =
  Pick<V2WorkflowPayload, 'assigned_items' | 'dataset' | 'name' | 'thumbnails'>

const Template: Story = () => Vue.extend({
  components: { AnnotatorsWorkflowCard },
  computed: {
    dataset (): V2WorkflowDatasetPayload | undefined {
      const { dataset, dataset_id, dataset_name, instructions } = this.$props as DatasetArgs

      if (!dataset) { return }

      return {
        annotation_hotkeys: {},
        id: dataset_id,
        name: dataset_name,
        instructions
      }
    },
    workflow (): Workflow {
      const { assigned_items, name, thumbnails } = this.$props as WorkflowArgs
      const dataset = this.dataset as V2WorkflowDatasetPayload

      return { assigned_items, dataset, name, thumbnails }
    }
  },
  props: Object.keys(argTypes),
  store,
  template: '<annotators-workflow-card :workflow="workflow" />'
})

export const Default: Story = Template.bind({})
Default.args = {
  assigned_items: 30,
  dataset: true,
  dataset_id: 1,
  dataset_name: 'Dataset A',
  instructions: 'Lorem ipsum',
  name: 'brain-scan-workflow',
  thumbnails: [
    'https://via.placeholder.com/150',
    'https://via.placeholder.com/150',
    'https://via.placeholder.com/150'
  ]
}

export const NoAssignedItems: Story = Template.bind({})
NoAssignedItems.args = {
  ...Default.args,
  assigned_items: 0
}

export const NoDataset: Story = Template.bind({})
NoDataset.args = {
  ...Default.args,
  dataset: false
}
