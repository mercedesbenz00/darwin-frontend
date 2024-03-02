import { action } from '@storybook/addon-actions'
import Vue from 'vue'

import Info from './Info.vue'

const stories = {
  title: 'Common/Info',
  component: Info,
  argTypes: {
    content: { control: 'text' },
    title: { control: 'text' }
  }
}

export default stories

const buildActions = () => ({
  click: action('click')
})

type Args = Partial<Record<keyof typeof stories.argTypes, any>>
type StoryConfig = { argTypes: typeof stories.argTypes }

const baseArgs: Args = {
  content: 'Random content, supporting HTML'
}

export const Interactive = (args: Args, { argTypes }: StoryConfig) => Vue.extend({
  components: { Info },
  props: Object.keys(argTypes),
  data () { return { actions: buildActions() } },
  template: `
    <info v-bind="$props" v-on="actions">
      <div v-html="content" />
    </info>
  `
})

Interactive.args = { ...baseArgs }

export const WithTitle = (args: Args, { argTypes }: StoryConfig) => Vue.extend({
  components: { Info },
  props: Object.keys(argTypes),
  data () { return { actions: buildActions() } },
  template: `
    <info v-bind="$props" v-on="actions">
      <div v-html="content" />
    </info>
  `
})

WithTitle.args = { ...baseArgs, title: 'This is a title' }
