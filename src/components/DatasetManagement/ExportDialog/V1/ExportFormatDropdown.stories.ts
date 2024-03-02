import { action } from '@storybook/addon-actions'

import ExportFormatDropdown from './ExportFormatDropdown.vue'

const stories = {
  title: 'ExportDialog/ExportFormatDropdown',
  component: ExportFormatDropdown
}

export default stories

const buildActions = () => ({
  change: action('change')
})

export const Interactive = () => ({
  components: { ExportFormatDropdown },
  data () {
    return {
      actions: buildActions(),
      value: 'json'
    }
  },
  template: '<export-format-dropdown v-model="value" v-on="actions" />'
})
