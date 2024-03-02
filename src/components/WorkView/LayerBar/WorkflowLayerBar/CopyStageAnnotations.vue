<template>
  <div class="copy">
    <p
      class="copy__description"
    >
      In case this image contains duplicates to the previous images,
      you can copy the layers from the previous image.
    </p>
    <circle-spinner
      v-if="busy"
      class="copy__spinner"
      :dark="true"
      :width="40"
      :height="40"
    />
    <secondary-button
      v-else
      :disabled="!enabled"
      @click="copyAnnotations"
    >
      Copy instances
    </secondary-button>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { CircleSpinner } from '@/components/Common/LoadingIndicators'
import copyStageAnnotations from '@/store/modules/workview/actions/copyStageAnnotations'
import { DatasetItemPayload, StoreActionPayload } from '@/store/types'
import { ErrorCodes } from '@/utils/error/errors'

@Component({ name: 'copy-stage-annotations', components: { CircleSpinner } })
export default class CopyStageAnnotations extends Vue {
  busy: boolean = false

  @State(state => state.workview.selectedDatasetItem)
  selectedDatasetItem!: DatasetItemPayload

  @State(state => state.workview.datasetItems)
  datasetItems!: DatasetItemPayload[]

  get annotatedPredecessor (): DatasetItemPayload | null {
    const { selectedDatasetItem, datasetItems } = this
    if (!selectedDatasetItem) { return null }

    for (let i = datasetItems.indexOf(selectedDatasetItem) - 1; i >= 0; i--) {
      const item = datasetItems[i]
      if (!item || !item.current_workflow) { continue }
      return item
    }

    return null
  }

  async copyAnnotations (): Promise<void> {
    this.busy = true

    const { annotatedPredecessor: fromItem, selectedDatasetItem: toItem } = this
    if (!toItem || !fromItem) { return }

    if (!fromItem.current_workflow) {
      throw new Error('CopyStageAnnotations: Expected source item to have a workflow')
    }

    const stageNumber = fromItem.current_workflow.current_stage_number
    const fromStage = fromItem.current_workflow.stages[stageNumber][0]

    const {
      data: toStage,
      error
    } = await this.$store.dispatch('workview/resolveStageForSelectedItem')

    if (error) {
      this.busy = false
      if (error.code === ErrorCodes.OUT_OF_SUBSCRIBED_STORAGE) {
        this.$store.commit('billing/SHOW_OUT_OF_STORAGE_DIALOG')
        return
      }
      return this.$store.dispatch('toast/warning', { content: error.message })
    }

    const copyPayload: StoreActionPayload<typeof copyStageAnnotations> = { fromStage, toStage }
    const {
      error: copyError
    } = await this.$store.dispatch('workview/copyStageAnnotations', copyPayload)

    this.busy = false

    if (copyError) { this.$store.dispatch('toast/warning', { content: copyError.message }) }
  }

  get enabled () {
    return this.annotatedPredecessor !== null
  }
}
</script>

<style lang="scss" scoped>
.copy {
  @include col--center;
}
.copy__description {
  padding: 0 20px 30px;
  @include typography(md, default, 500);
  color: $colorGrayLite;
}

.copy__spinner {
  margin: -100px;
}
</style>
