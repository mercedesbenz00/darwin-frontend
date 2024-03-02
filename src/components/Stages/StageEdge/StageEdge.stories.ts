import { Story, StoryContext } from '@storybook/vue'
import { defineComponent } from 'vue'

import StageEdge from '@/components/Stages/StageEdge/StageEdge.vue'
import { EdgeType, StageEdgeProps } from '@/components/Stages/StageEdge/types'
import { useStore } from '@/composables/useStore'
import { useWorkflowSceneStore } from '@/composables/useWorkflowSceneStore'
import store, { resetStore } from '@/store'
import { StageType } from '@/store/types/StageType'
import { memberships, teams } from '@/storybook/fixtures'
import { baseWorkflow } from '@/storybook/fixtures/__mocks__/workflow/setupMultiple'

const stories: Partial<StoryContext> = {
  title: 'Stages/Edge',
  argTypes: {
    connected: {
      name: 'Connected',
      table: {
        disable: true
      }
    },
    connectable: {
      name: 'Connectable',
      table: {
        disable: true
      }
    },
    type: {
      name: 'Type',
      control: {
        type: 'select',
        options: ['default', 'review', 'annotate']
      },
      description: 'Defines the theme for the component',
      table: {
        type: { summary: 'StageType' },
        defaultValue: { summary: 'annotate' }
      }
    },
    id: {
      name: 'ID',
      table: {
        disable: true
      }
    },
    edgeType: {
      name: 'Edge Type',
      control: {
        type: 'select',
        options: ['in', 'out']
      },
      description: 'Checks if component is wether an in or out edge',
      table: {
        type: { summary: "StageEdgeTypes['edgeType']" },
        defaultValue: { summary: 'out' }
      }
    },
    currentStagePosition: {
      name: 'Current Stage Position',
      table: {
        disable: true
      }
    }
  }
}

export default stories

const { v7 } = teams

export const Default: Story<StageEdgeProps> = (args, { argTypes }) => defineComponent({
  components: { StageEdge },
  props: Object.keys(argTypes),
  store,
  created () {
    resetStore()
    const store = useStore()
    store.commit('team/SET_CURRENT_TEAM', v7)
    store.commit('team/SET_MEMBERSHIPS', Object.values(memberships))
    store.commit('v2Workflow/SET_WORKFLOW', baseWorkflow)
  },
  setup () {
    const scene = useWorkflowSceneStore()
    scene.setZoomScale(1)
  },
  template: `
    <div style='display: block; position:relative; width: 400px; height: 400px;'>
      <StageEdge v-bind='$props' />
    </div>
  `
})

Default.args = {
  id: '1',
  edge: baseWorkflow.stages[0].edges[0],
  edgeType: EdgeType.OUT,
  connectable: true,
  type: StageType.Annotate,
  currentStagePosition: {
    x: 0,
    y: 0
  }
}
