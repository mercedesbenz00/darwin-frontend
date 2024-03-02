import { action } from '@storybook/addon-actions'
import Vue from 'vue'
import Modal from 'vue-js-modal'

import { ConfirmationDialog } from '@/components/Common/ConfirmationDialog/V2'
import store from '@/store'

const stories = {
  title: 'Common/ConfirmationDialog/Versions/V2',
  argTypes: {
    title: { control: 'text' },
    detail: { control: 'text' },
    buttonText: { control: 'text' }
  }
}

export default stories

const buildActions = () => ({
  canceled: action('canceled'),
  confirmed: action('confirmed')
})

type Args = Record<keyof typeof stories.argTypes, any>

export const Default = (args: Args, { argTypes }: any) => ({
  components: { Modal, ConfirmationDialog },
  data: () => ({ actions: buildActions() }),
  props: Object.keys(argTypes),
  mounted () {
    (this as unknown as Vue).$modal.show('confirm-dialog')
  },
  store,
  template: `
    <confirmation-dialog
      v-bind="$props"
      name="confirm-dialog"
      v-on="actions"
    />
  `
})

Default.args = {
  title: 'Are you sure you wish to do this?',
  detail: 'Make sure you are completely sure you want to do this.',
  buttonText: 'Okay'
}
