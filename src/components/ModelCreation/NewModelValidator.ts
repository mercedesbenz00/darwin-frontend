import { Vue, Component, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { DatasetPayload, ModelTemplatePayload } from '@/store/types'

/**
 * Automatically validate current new model data in the store
 */
@Component({ name: 'new-model-validator' })
export default class NewModelValidator extends Vue {
  mounted (): void {
    this.validate()
  }

  render (): null {
    return null
  }

  @State(state => state.neuralModel.newModelName)
  newModelName!: string

  @Watch('newModelName')
  onNewModelName (): void {
    this.validate()
  }

  @State(state => state.neuralModel.newModelDataset)
  newModelDataset!: DatasetPayload | null

  @Watch('newModelDataset')
  onNewModelDataset (): void {
    this.validate()
  }

  @State(state => state.neuralModel.newModelTemplate)
  newModelTemplate!: ModelTemplatePayload | null

  @Watch('newModelTemplate')
  onNewModelTemplate (): void {
    this.validate()
  }

  @State(state => state.neuralModel.newModelSelectedClassIds.length)
  newModelSelectedClassIdsLength!: number

  @Watch('newModelSelectedClassIdsLength')
  onNewModelSelectedClassIdsLength (): void {
    this.validate()
  }

  @State(state => state.neuralModel.newModelSampleItems.length)
  newModelSampleItemsLength!: number

  @State(state => state.neuralModel.newModelSampleItemsV2.length)
  newModelSampleItemsLengthV2!: number

  @Watch('newModelSampleItemsLength')
  onNewModelSampleItemsLength (): void {
    this.validate()
  }

  @Watch('newModelSampleItemsLengthV2')
  onNewModelSampleItemsLengthV2 (): void {
    this.validate()
  }

  validate (): void {
    this.$store.commit('neuralModel/VALIDATE_NEW_MODEL')
  }
}
