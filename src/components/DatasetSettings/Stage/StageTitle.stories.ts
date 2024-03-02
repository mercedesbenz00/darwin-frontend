import { action } from '@storybook/addon-actions'

import StageTitle from './StageTitle.vue'

const stories = {
  title: 'DatasetSettings/Stage/StageTitle',
  component: StageTitle,
  argTypes: {
    value: { control: 'text' }
  }
}

export default stories

type Opts = { argTypes: typeof stories.argTypes }
type Args = Record<keyof Opts['argTypes'], any>

const listeners = () => ({
  change: action('change')
})

export const Normal = (args: Args, { argTypes }: Opts) => ({
  components: { StageTitle },
  props: Object.keys(argTypes),
  data () { return { listeners: listeners() } },
  template: '<stage-title v-bind="$props" v-on="listeners" />'

})

Normal.args = {
  value: 'A stage'
}
