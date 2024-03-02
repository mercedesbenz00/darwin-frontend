import { action } from '@storybook/addon-actions'
import { Meta, Story } from '@storybook/vue'

import { IconMonoIdle } from '@/assets/icons/V2/Mono'

import ActionBarDefault from './ActionBarDefault.vue'

export default {
  title: 'Common/ActionBar/ActionBarElement/Default',
  argTypes: {
    active: {
      control: 'boolean',
      description: 'Toggles active state of component'
    },
    showIcon: {
      control: 'boolean',
      description: 'Toggles show icon. Story property only, not part of component props'
    }
  }
} as Meta<typeof ActionBarDefault>

export const Default: Story<
  { active?: boolean; showIcon: boolean; disabled?: string }
> = (args, { argTypes }) => ({
  components: {
    ActionBarDefault,
    IconMonoIdle
  },
  props: Object.keys(argTypes),
  methods: { click: action('click') },
  template: `
    <div style='margin-top:100px;margin-left:100px;'>
      <action-bar-default v-bind='$props' @click='click'>
        <template #prefixComp v-if='!!$props.showIcon'>
          <icon-mono-idle />
        </template>
        Stage
      </action-bar-default>
    </div>
  `
})

Default.args = {
  active: false,
  disabled: 'Previous assignment is in progress, some selected items are not assignable.',
  // Story property only. Not part of component props
  showIcon: true
}
