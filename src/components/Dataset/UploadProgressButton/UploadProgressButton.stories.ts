import { Meta, Story } from '@storybook/vue'

import UploadProgressButton from '@/components/Dataset/UploadProgressButton/UploadProgressButton.vue'

export default {
  title: 'Dataset/UploadProgressButton',
  argTypes: {}
} as Meta<typeof UploadProgressButton>

export const Default: Story = (args, { argTypes }) => ({
  components: { UploadProgressButton },
  props: Object.keys(argTypes),
  template: '<upload-progress-button v-bind="$props" />'
})

Default.args = {
  uploadProgress: 50
}
