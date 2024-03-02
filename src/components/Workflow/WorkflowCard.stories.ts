import RouteMock from 'storybook-vue-router'
import Vue from 'vue'

import store from '@/store'
import { V2WorkflowPayload } from '@/store/types'
import { workflowBuilder } from '@/storybook/fixtures/__mocks__/workflow/workflow'

import WorkflowCard from './WorkflowCard.vue'

const colors = require('@/assets/styles/darwin/variables/colors.module.scss')

const stories = {
  title: 'Workflow/WorkflowCard',
  argTypes: {
    data: { control: 'object' },
    disableMenu: { control: 'boolean' },
    selectable: { control: 'boolean' },
    selected: { control: 'boolean' },
    onClick: { action: 'click' }
  },
  parameters: {
    backgrounds: {
      default: 'AliceShade',
      values: [
        { name: 'White', value: colors.colorWhite },
        { name: 'AliceBlue', value: colors.colorAliceBlue },
        { name: 'AliceShade', value: colors.colorAliceShade },
        { name: 'AliceShadow', value: colors.colorAliceShadow }
      ]
    }
  },
  decorators: [RouteMock()]
}

export default stories

type Args = Record<keyof typeof stories.argTypes, unknown>

const thumbnails = [
  'https://via.placeholder.com/150',
  'https://via.placeholder.com/150',
  'https://via.placeholder.com/150'
]

// DEFAULT
const workflow: V2WorkflowPayload = workflowBuilder({
  inserted_at: '2022-01-01T01:01:01',
  updated_at: '2022-02-02T02:02:02',
  status: 'running',
  thumbnails,
  progress: {
    idle: 0,
    total: 11123,
    complete: 11000,
    in_progress: 123
  }
})

export const Default = (args: Args, { argTypes }: any) => Vue.extend({
  components: { WorkflowCard },
  props: Object.keys(argTypes),
  store,
  data: () => ({
    workflow
  }),
  template: `
    <workflow-card
      :id="\`dataset-${workflow.id}\`"
      :key="workflow.id"
      class="workflow-section__card"
      :data="workflow"
      selectable
      @click="onClickWorkflow"
    />
  `,
  methods: { onClickWorkflow: args.onClick }
})

Default.args = {
  data: workflow,
  disableMenu: false,
  selected: false,
  selectable: false
}

// NO MENU
export const NoMenu = (args: Args, { argTypes }: any) => Vue.extend({
  components: { WorkflowCard },
  props: Object.keys(argTypes),
  store,
  data: () => ({
    workflow
  }),
  template: `
    <workflow-card
      :id="\`dataset-${workflow.id}\`"
      :key="workflow.id"
      class="workflow-section__card"
      :data="workflow"
      disable-menu
      selectable
      @click="onClickWorkflow"
    />
  `,
  methods: { onClickWorkflow: args.onClick }
})

NoMenu.args = {
  data: workflow,
  disableMenu: false,
  selected: false,
  selectable: false
}

// TWO THUMBNAILS
const workflowTwoThumbnail = {
  ...workflow,
  thumbnails: ['/static/test.png', '/static/test.png']
}

export const TwoThumbnail = (args: Args, { argTypes }: any) => Vue.extend({
  components: { WorkflowCard },
  props: Object.keys(argTypes),
  store,
  data: () => ({
    workflowTwoThumbnail
  }),
  template: `
    <workflow-card
      :id="\`dataset-${workflowTwoThumbnail.id}\`"
      :key="workflowTwoThumbnail.id"
      class="workflow-section__card"
      :data="workflowTwoThumbnail"
      selectable
      @click="onClickWorkflow"
    />
  `,
  methods: { onClickWorkflow: args.onClick }
})

TwoThumbnail.args = {
  data: workflowTwoThumbnail,
  disableMenu: false
}

// ONE THUMBNAILS
const workflowOneThumbnail = {
  ...workflow,
  thumbnails: ['/static/test.png']
}

export const OneThumbnail = (args: Args, { argTypes }: any) => Vue.extend({
  components: { WorkflowCard },
  props: Object.keys(argTypes),
  store,
  data: () => ({
    workflowOneThumbnail
  }),
  template: `
    <workflow-card
      :id="\`dataset-${workflowOneThumbnail.id}\`"
      :key="workflowOneThumbnail.id"
      class="workflow-section__card"
      :data="workflowOneThumbnail"
      selectable
      @click="onClickWorkflow"      
    />
  `,
  methods: { onClickWorkflow: args.onClick }
})

OneThumbnail.args = {
  data: workflowOneThumbnail,
  disableMenu: false
}

// NO DATA
const workflowNoData = {
  ...workflow,
  thumbnails: [],
  stats: {
    files: 0,
    completed: 0,
    inProgress: 0
  }
}

export const NoData = (args: Args, { argTypes }: any) => Vue.extend({
  components: { WorkflowCard },
  props: Object.keys(argTypes),
  store,
  data: () => ({
    workflowNoData
  }),
  template: `
    <workflow-card
      :id="\`dataset-${workflowNoData.id}\`"
      :key="workflowNoData.id"
      class="workflow-section__card"
      :data="workflowNoData"
      selectable
      @click="onClickWorkflow"
    />
  `,
  methods: { onClickWorkflow: args.onClick }
})

NoData.args = {
  data: workflowNoData,
  disableMenu: false
}
