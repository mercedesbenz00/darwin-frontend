import { action } from '@storybook/addon-actions'
import Vue from 'vue'
import Modal from 'vue-js-modal'

import { DeleteConfirmationDialog } from '@/components/Common/DeleteConfirmationDialog/V2'
import store from '@/store'

const stories = {
  title: 'Common/DeleteConfirmationDialog/Versions/V2',
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
  components: { Modal, DeleteConfirmationDialog },
  data: () => ({ actions: buildActions() }),
  props: Object.keys(argTypes),
  mounted () {
    (this as unknown as Vue).$modal.show('confirm-delete')
  },
  store,
  template: `
    <delete-confirmation-dialog-component
      v-bind="$props"
      name="confirm-delete"
      v-on="actions"
    />
  `
})

Default.args = {
  title: 'Are you sure you wish to delete these images?',
  detail: 'This will permanently delete the selected images. It cannot be undone.',
  buttonText: 'Delete'
}
