import { action } from '@storybook/addon-actions'
import Vue from 'vue'

import { slider } from '@/storybook/controls/slider'

import RoundedToggleButton from './RoundedToggleButton.vue'

const stories = {
  title: 'Common/Button/V1/RoundedToggleButton',
  component: RoundedToggleButton,
  argTypes: {
    selected: { control: 'boolean' }
  }
}

export default stories

type Args = Record<keyof typeof stories.argTypes, any>

const baseArgs: Args = {
  selected: false
}

const buildActions = () => ({
  toggle: action('toggle')
})

export const Interactive = (args: Args, { argTypes }: any) => Vue.extend({
  components: { RoundedToggleButton },
  props: Object.keys(argTypes),
  data () {
    return {
      actions: buildActions(),
      selected: true
    }
  },
  methods: {
    toggle (): void {
      this.selected = !this.selected
    }
  },
  template:
    '<rounded-toggle-button v-bind="$props" :selected="selected" v-on="actions" @change="toggle" />'
})

Interactive.args = { ...baseArgs }

type StoryConfig = { argTypes: typeof stories.argTypes }

export const LimitedContainerWidth = (args: Args, { argTypes }: StoryConfig) => Vue.extend({
  components: { RoundedToggleButton },
  props: Object.keys(argTypes),
  data () {
    return {
      actions: buildActions()
    }
  },
  computed: {
    style: {
      get (): Record<string, string> {
        return {
          width: `${this.width}px`,
          display: 'grid',
          gap: '.5em'
        }
      }
    }
  },
  template: `
    <div :style=style>
      <rounded-toggle-button v-bind="$props" v-on="actions"/>
    </div>
  `
})

LimitedContainerWidth.argTypes = {
  ...stories.argTypes,
  width: slider(0, 500)
}

LimitedContainerWidth.args = {
  width: 200,
  ...baseArgs
}
