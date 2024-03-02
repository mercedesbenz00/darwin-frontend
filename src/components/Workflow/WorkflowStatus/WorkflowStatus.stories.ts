import { action } from '@storybook/addon-actions'
import { Meta, Story } from '@storybook/vue'

import { WorkflowStatus, WorkflowStatusVariant, WorkflowStatusProps } from '.'

const colors = require('@/assets/styles/darwin/variables/colors.module.scss')

export default {
  title: 'Workflow/WorkflowStatus',
  argTypes: {
    variant: {
      control: {
        type: 'select',
        options: Object.entries(WorkflowStatusVariant).map((val) => val[1])
      },
      description: 'Changes Workflow status variant.',
      table: {
        type: { summary: 'WorkflowStatusVariant' },
        defaultValue: { summary: 'WorkflowStatusVariant.ACTIVE' }
      }
    },
    dense: {
      control: 'boolean',
      description: 'Reduce the padding of the component - true | false',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' }
      }
    }
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
  }
} as Meta<typeof WorkflowStatus>

// WORKFLOW STATUS ACTIVE
export const WorkflowStatusActive: Story<WorkflowStatusProps> = (args, { argTypes }) => ({
  components: { WorkflowStatus },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: '<workflow-status v-bind="$props" style="float: left" />'
})
WorkflowStatusActive.args = {
  variant: WorkflowStatusVariant.ACTIVE,
  dense: false
}

// WORKFLOW STATUS ACTIVE DENSE
export const WorkflowStatusActiveDense: Story<WorkflowStatusProps> = (args, { argTypes }) => ({
  components: { WorkflowStatus },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: '<workflow-status v-bind="$props" style="float: left" />'
})
WorkflowStatusActiveDense.args = {
  variant: WorkflowStatusVariant.ACTIVE,
  dense: true
}

// WORKFLOW STATUS RUNNING
export const WorkflowStatusRunning: Story<WorkflowStatusProps> = (args, { argTypes }) => ({
  components: { WorkflowStatus },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: '<workflow-status v-bind="$props" style="float: left" />'
})
WorkflowStatusRunning.args = {
  variant: WorkflowStatusVariant.RUNNING
}

// WORKFLOW STATUS RUNNING DENSE
export const WorkflowStatusRunningDense: Story<WorkflowStatusProps> = (args, { argTypes }) => ({
  components: { WorkflowStatus },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: '<workflow-status v-bind="$props" style="float: left" />'
})
WorkflowStatusRunningDense.args = {
  variant: WorkflowStatusVariant.RUNNING,
  dense: true
}

// WORKFLOW STATUS DRAFT
export const WorkflowStatusDraft: Story<WorkflowStatusProps> = (args, { argTypes }) => ({
  components: { WorkflowStatus },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: '<workflow-status v-bind="$props" style="float: left" />'
})
WorkflowStatusDraft.args = {
  variant: WorkflowStatusVariant.DRAFT
}

// WORKFLOW STATUS DRAFT DENSE
export const WorkflowStatusDraftDense: Story<WorkflowStatusProps> = (args, { argTypes }) => ({
  components: { WorkflowStatus },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: '<workflow-status v-bind="$props" style="float: left" />'
})
WorkflowStatusDraftDense.args = {
  variant: WorkflowStatusVariant.DRAFT,
  dense: true
}

// WORKFLOW STATUS OFFLINE
export const WorkflowStatusOffline: Story<WorkflowStatusProps> = (args, { argTypes }) => ({
  components: { WorkflowStatus },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: '<workflow-status v-bind="$props" style="float: left" />'
})
WorkflowStatusOffline.args = {
  variant: WorkflowStatusVariant.OFFLINE
}

// WORKFLOW STATUS OFFLINE DENSE
export const WorkflowStatusOfflineDense: Story<WorkflowStatusProps> = (args, { argTypes }) => ({
  components: { WorkflowStatus },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: '<workflow-status v-bind="$props" style="float: left" />'
})
WorkflowStatusOfflineDense.args = {
  variant: WorkflowStatusVariant.OFFLINE,
  dense: true
}

// WORKFLOW STATUS INACTIVE
export const WorkflowStatusInactive: Story<WorkflowStatusProps> = (args, { argTypes }) => ({
  components: { WorkflowStatus },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: '<workflow-status v-bind="$props" style="float: left" />'
})
WorkflowStatusInactive.args = {
  variant: WorkflowStatusVariant.INACTIVE
}

// WORKFLOW STATUS INACTIVE DENSE
export const WorkflowStatusInactiveDense: Story<WorkflowStatusProps> = (args, { argTypes }) => ({
  components: { WorkflowStatus },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: '<workflow-status v-bind="$props" style="float: left" />'
})
WorkflowStatusInactiveDense.args = {
  variant: WorkflowStatusVariant.INACTIVE,
  dense: true
}
