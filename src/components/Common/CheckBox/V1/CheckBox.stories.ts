import { action } from '@storybook/addon-actions'
import Vue from 'vue'

import { slider } from '@/storybook/controls/slider'

import CheckBox from './CheckBox.vue'

const stories = {
  title: 'Common/CheckBox',
  component: CheckBox,
  argTypes: {
    chkValue: { control: 'text' },
    disabled: { control: 'boolean' },
    id: { control: 'text' },
    label: { control: 'text' },
    name: { control: 'text' },
    size: { control: { type: 'radio', options: ['default', 'small'] } },
    type: { control: { type: 'radio', options: ['rect', 'circle'] } },
    value: { control: 'boolean' }
  }
}

export default stories

type Args = Record<keyof typeof stories.argTypes, any>

const baseArgs: Args = {
  chkValue: null,
  disabled: false,
  id: null,
  label: 'My Checkbox',
  name: null,
  size: 'default',
  type: 'rect',
  value: true
}

const buildActions = () => ({
  change: action('change'),
  input: action('input')
})

export const Interactive = (args: Args, { argTypes }: any) => Vue.extend({
  components: { CheckBox },
  props: Object.keys(argTypes),
  data () {
    return {
      actions: buildActions(),
      checked: true
    }
  },
  methods: {
    toggleCheck (): void {
      this.checked = !this.checked
    }
  },
  template:
    '<check-box v-bind="$props" :value="checked" v-on="actions" @change="toggleCheck" />'
})

Interactive.args = { ...baseArgs }

type StoryConfig = { argTypes: typeof stories.argTypes }

export const LimitedContainerWidth = (args: Args, { argTypes }: StoryConfig) => Vue.extend({
  components: { CheckBox },
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
      <check-box v-bind="$props" v-on="actions"/>
    </div>
  `
})

LimitedContainerWidth.argTypes = {
  ...stories.argTypes,
  width: slider(0, 500)
}
LimitedContainerWidth.args = {
  width: 200,
  ...baseArgs,
  value: 'SingleLongWordToSeeHowEllipsisWorks',
  shortValue: 'Short value',
  options: [
    'FirstSingleLongOptionToSeeHowEllipsisWorks',
    'SecondSingleLongOptionToSeeHowEllipsisWorks',
    'Short one'
  ]
}
