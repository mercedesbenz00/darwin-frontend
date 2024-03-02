import { Vue, Component } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { DatasetPayload } from '@/store/types'

/**
 * Load neural models each time the workview dataset is reset.
 * When in 'review' mode, only load the neural models according to the dataset settings.
 */
@Component({ name: 'models-loader' })
export default class ModelsLoader extends Vue {
  @State(state => state.workview.dataset)
  dataset!: DatasetPayload

  async mounted () {
    const { error } =
      await this.$store.dispatch('workview/loadAutoAnnotateModels')
    if (error) { this.$store.dispatch('toast/warning', { content: error.message }) }
  }

  render () {
    return null
  }
}
