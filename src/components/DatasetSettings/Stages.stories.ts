import { Story, StoryContext } from '@storybook/vue'

import store from '@/store'
import { FeaturePayload } from '@/store/types'
import { teams, memberships, workflowTemplates } from '@/storybook/fixtures'
import { sfh } from '@/storybook/fixtures/datasets'

import Stages from './Stages.vue'

const stories: Partial<StoryContext> = {
  title: 'DatasetSettings/Stages',
  argTypes: {
    dataset: { name: 'Dataset', control: 'object' },
    template: { name: 'Template', control: 'object' }
  }
}

export default stories

const { v7 } = teams

const setupStore = (vm: Vue): void => {
  const store = vm.$store
  const features: FeaturePayload[] = [
    { name: 'CODE_STAGE', enabled: true },
    { name: 'MODEL_STAGE', enabled: true },
    { name: 'BLIND_STAGE', enabled: true }
  ]
  store.commit('features/SET_FEATURES', features)
  store.commit('team/SET_CURRENT_TEAM', v7)
  store.commit('team/SET_MEMBERSHIPS', Object.values(memberships))
}

const { arc, mmlarc, blind } = workflowTemplates

export const ARC: Story = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { Stages },
  template: '<stages v-bind="$props" />',
  store,
  created (): void {
    setupStore(this as unknown as Vue)
  }
})

ARC.args = { dataset: sfh, template: arc }

export const MMLARC: Story = (args, { argTypes }) => ({
  components: { Stages },
  props: Object.keys(argTypes),
  template: '<stages v-bind="$props" />',
  store,
  created (): void {
    setupStore(this as unknown as Vue)
  }
})

MMLARC.args = { dataset: sfh, template: mmlarc }

export const BLIND: Story = (args, { argTypes }) => ({
  components: { Stages },
  props: Object.keys(argTypes),
  template: '<stages v-bind="$props" />',
  store,
  created (): void {
    setupStore(this as unknown as Vue)
  }
})

BLIND.args = { dataset: sfh, template: blind }
