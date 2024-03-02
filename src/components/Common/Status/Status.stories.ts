import { action } from '@storybook/addon-actions'
import { Meta, Story } from '@storybook/vue'

import { Status, StatusOptions, StatusProps } from '.'

export default {
  title: 'Common/Status',
  argTypes: {
    value: {
      control: {
        type: 'select',
        options: Object.entries(StatusOptions).map((val) => val[1])
      },
      description:
        'Changes Status variant. Choose between - ACTIVE | RUNNING | DRAFT | OFFLINE | INACTIVE',
      table: {
        type: { summary: 'StatusOptions' },
        defaultValue: { summary: 'StatusOptions.ACTIVE' }
      }
    },
    outline: {
      control: 'boolean',
      description: 'Show an outline around the Status. Choose between - true | false',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' }
      }
    }
  }
} as Meta<typeof Status>

// STATUS ACTIVE
export const StatusActive: Story<StatusProps> = (args, { argTypes }) => ({
  components: { Status },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: '<status v-bind="$props" style="float: left" />'
})
StatusActive.args = {
  value: StatusOptions.ACTIVE,
  outline: false
}

// STATUS ACTIVE OUTLINED
export const StatusActiveOutlined: Story<StatusProps> = (args, { argTypes }) => ({
  components: { Status },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: '<status v-bind="$props" style="float: left" />'
})
StatusActiveOutlined.args = {
  value: StatusOptions.ACTIVE,
  outline: true
}

// STATUS RUNNING
export const StatusRunning: Story<StatusProps> = (args, { argTypes }) => ({
  components: { Status },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: '<status v-bind="$props" style="float: left" />'
})
StatusRunning.args = {
  value: StatusOptions.RUNNING
}

// STATUS RUNNING OUTLINED
export const StatusRunningOutlined: Story<StatusProps> = (args, { argTypes }) => ({
  components: { Status },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: '<status v-bind="$props" style="float: left" />'
})
StatusRunningOutlined.args = {
  value: StatusOptions.RUNNING,
  outline: true
}

// STATUS DRAFT
export const StatusDraft: Story<StatusProps> = (args, { argTypes }) => ({
  components: { Status },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: '<status v-bind="$props" style="float: left" />'
})
StatusDraft.args = {
  value: StatusOptions.DRAFT
}

// STATUS DRAFT OUTLINED
export const StatusDraftOutlined: Story<StatusProps> = (args, { argTypes }) => ({
  components: { Status },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: '<status v-bind="$props" style="float: left" />'
})
StatusDraftOutlined.args = {
  value: StatusOptions.DRAFT,
  outline: true
}

// STATUS OFFLINE
export const StatusOffline: Story<StatusProps> = (args, { argTypes }) => ({
  components: { Status },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: '<status v-bind="$props" style="float: left" />'
})
StatusOffline.args = {
  value: StatusOptions.OFFLINE
}

// STATUS OFFLINE OUTLINED
export const StatusOfflineOutlined: Story<StatusProps> = (args, { argTypes }) => ({
  components: { Status },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: '<status v-bind="$props" style="float: left" />'
})
StatusOfflineOutlined.args = {
  value: StatusOptions.OFFLINE,
  outline: true
}

// STATUS INACTIVE
export const StatusInactive: Story<StatusProps> = (args, { argTypes }) => ({
  components: { Status },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: '<status v-bind="$props" style="float: left" />'
})
StatusInactive.args = {
  value: StatusOptions.INACTIVE
}

// STATUS INACTIVE OUTLINED
export const StatusInactiveOutlined: Story<StatusProps> = (args, { argTypes }) => ({
  components: { Status },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: '<status v-bind="$props" style="float: left" />'
})
StatusInactiveOutlined.args = {
  value: StatusOptions.INACTIVE,
  outline: true
}
