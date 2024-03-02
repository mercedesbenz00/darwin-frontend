import { action } from '@storybook/addon-actions'
import { Meta, Story } from '@storybook/vue'

import { IconMonoStep } from '@/assets/icons/V2/Mono'

import ActionBarRestore from './ActionBarRestore.vue'

export default {
  title: 'Common/ActionBar/ActionBarElement/Restore',
  argTypes: {
    active: {
      control: 'boolean',
      description: 'Toggles active state of component'
    }
  }
} as Meta<typeof ActionBarRestore>

export const Default: Story<
  { active?: boolean; disabled?: string }
> = (args, { argTypes }) => ({
  components: {
    ActionBarRestore,
    IconMonoStep
  },
  props: Object.keys(argTypes),
  methods: { click: action('click') },
  template: `
    <div style='margin-top:100px;margin-left:100px;'>
      <action-bar-restore v-bind='$props' @click='click'>
        <icon-mono-step />
      </action-bar-restore>
    </div>
  `
})

Default.args = {
  active: false
}
