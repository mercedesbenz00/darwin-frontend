import { action } from '@storybook/addon-actions'

import V2ExportFormatDropdown from './V2ExportFormatDropdown.vue'

const stories = {
  title: 'ExportDialog/V2ExportFormatDropdown',
  component: V2ExportFormatDropdown
}

export default stories

const buildActions = () => ({
  change: action('change')
})

export const Interactive = () => ({
  components: { V2ExportFormatDropdown },
  data () {
    return {
      actions: buildActions(),
      value: 'json'
    }
  },
  template: '<v2-export-format-dropdown v-model="value" v-on="actions" />'
})
