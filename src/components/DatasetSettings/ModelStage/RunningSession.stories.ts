import Vue from 'vue'

import { slider } from '@/storybook/controls/slider'
import { boxotron } from '@/storybook/fixtures/runningSessions'

import RunningSession from './RunningSession.vue'

const stories = {
  component: RunningSession,
  title: 'DatasetSettings/ModelStage/RunningSession',
  argTypes: {
    runningSession: { control: 'object' },
    width: slider(100, 300)
  }
}

export default stories

type Args = Record<keyof typeof stories.argTypes, any>
type StoryConfig = { argTypes: typeof stories.argTypes }

export const Normal = (args: Args, { argTypes }: StoryConfig) => Vue.extend({
  components: { RunningSession },
  props: Object.keys(argTypes),
  computed: {
    style: {
      get (): Record<string, string> {
        const { width } = this
        return {
          width: `${width}px`
        }
      }
    }
  },
  template: `
    <div :style="style">
      <running-session :running-session="runningSession" />
      <running-session :running-session="{...runningSession, max: 0 }" />
    </div>
  `
})

Normal.args = { runningSession: boxotron, width: 250 }
