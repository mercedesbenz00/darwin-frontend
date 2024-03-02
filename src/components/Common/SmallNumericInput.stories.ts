import { action } from '@storybook/addon-actions'

import SmallNumericInput from './SmallNumericInput.vue'

const colors = require('@/assets/styles/darwin/variables/colors.module.scss')

const stories = {
  title: 'Common/SmallNumericInput',
  component: SmallNumericInput,
  argTypes: {
    value: { control: 'number', default: 30 },
    min: { control: 'number' },
    max: { control: 'number' }
  },
  parameters: {
    backgrounds: {
      default: 'AliceShade',
      values: [
        { name: 'AliceShade', value: colors.colorAliceShade }
      ]
    }
  }
}

export default stories

const buildActions = () => ({
  input: action('input')
})

type Args = Record<keyof typeof stories.argTypes, any>

export const Interactive = (args: Args, { argTypes }: any) => ({
  props: Object.keys(argTypes),
  components: { SmallNumericInput },
  data () { return { actions: buildActions() } },
  template: '<small-numeric-input v-bind="$props" v-on="actions"/>'
})

Interactive.args = {
  value: 30
}

export const WithMinMax = () => ({
  components: { SmallNumericInput },
  data () {
    return { min: 3, max: 30, value: 30 }
  },
  template: `
    <div>
      <h3 style="margin-bottom: 10px"> Min 3, Max 30 </h3>
      <small-numeric-input v-bind="$data" />
    </div>
  `
})
