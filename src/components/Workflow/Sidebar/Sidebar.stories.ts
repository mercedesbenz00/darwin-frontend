import { Meta, Story } from '@storybook/vue'
import { defineComponent } from 'vue'

import { useStore } from '@/composables/useStore'
import { useWorkflowSceneStore } from '@/composables/useWorkflowSceneStore'
import store, { resetStore } from '@/store'
import { workflowBuilder } from '@/storybook/fixtures/__mocks__/workflow/workflow'

import Sidebar from './Sidebar.vue'

export default {
  title: 'Layouts/Workflow/Sidebar',
  component: Sidebar
} as Meta<typeof Sidebar>

const workflow = workflowBuilder()

const setupStore = (): void => {
  resetStore()
  const store = useStore()
  store.commit('v2Workflow/SET_WORKFLOW', workflow)
}

export const Default: Story = (args, { argTypes }) => defineComponent({
  components: { Sidebar },
  props: Object.keys(argTypes),
  store,
  created (): void {
    setupStore()
  },
  setup () {
    const scene = useWorkflowSceneStore()
    scene.selectStage(workflow.stages[0])
  },
  template: '<sidebar v-bind="$props" />'
})

Default.storyName = 'Unselected'

export const Selected: Story = (args, { argTypes }) => defineComponent({
  components: { Sidebar },
  props: Object.keys(argTypes),
  store,
  created (): void {
    setupStore()
  },
  setup () {
    const scene = useWorkflowSceneStore()
    scene.selectStage(workflow.stages[0])
  },
  template: '<sidebar v-bind="$props" />'
})

Selected.storyName = 'Selected by Annotation'
