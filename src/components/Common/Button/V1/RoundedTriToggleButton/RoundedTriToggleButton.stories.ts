import { action } from '@storybook/addon-actions'
import Vue from 'vue'

import { slider } from '@/storybook/controls/slider'

import RoundedTriToggleButton from './RoundedTriToggleButton.vue'

const stories = {
  title: 'Common/RoundedTriToggleButton',
  component: RoundedTriToggleButton,
  argTypes: {
    status: { control: { type: 'radio', options: ['positive', 'negative', 'none'] } }
  }
}

export default stories

type Args = Record<keyof typeof stories.argTypes, any>

const baseArgs: Args = {
  status: 'none'
}

const buildActions = () => ({
  toggle: action('toggle')
})

export const Interactive = (args: Args, { argTypes }: any) => Vue.extend({
  components: { RoundedTriToggleButton },
  props: Object.keys(argTypes),
  data () {
    return {
      actions: buildActions()
    }
  },
  template:
    '<rounded-tri-toggle-button v-bind="$props" v-on="actions" />'
})

Interactive.args = { ...baseArgs }

type StoryConfig = { argTypes: typeof stories.argTypes }

export const LimitedContainerWidth = (args: Args, { argTypes }: StoryConfig) => Vue.extend({
  components: { RoundedTriToggleButton },
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
      <rounded-tri-toggle-button v-bind="$props" v-on="actions">
        Default Slot
      </rounded-tri-toggle-button>
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
