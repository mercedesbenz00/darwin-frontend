<template>
  <router-link
    class="workflow-image"
    replace
    :to="route"
  >
    <workview-image
      :selected="selected"
      :thumbnail="thumbnail"
      :filename="filename"
      :is-video="isVideo"
      previous-tooltip="Previous image (<)"
      next-tooltip="Next image (>)"
    >
      <status-button
        v-if="archivedStatus"
        class="workflow-image__status"
        :type="datasetItem.status"
        variant="inverted"
      />
      <div
        v-else-if="inActiveWorkflow"
        class="workflow-image__status"
      >
        <stage-instance-with-timer
          v-for="instance in instances"
          :key="instance.id"
          :instance="instance"
        />
      </div>
      <status-button
        v-else
        class="workflow-image__status"
        :type="datasetItem.status"
        variant="inverted"
      />
    </workview-image>
  </router-link>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { WorkviewImage } from '@/components/WorkView/BottomBar'
import StageInstanceWithTimer from '@/components/WorkView/Common/StageInstanceWithTimer.vue'
import StatusButton from '@/components/WorkView/Common/StatusButton/V2/StatusButton.vue'
import { resolveThumbnail, isDefaultAutoComplete } from '@/components/WorkView/utils'
import { DatasetItemPayload, WorkflowStagePayload } from '@/store/types'

import { WorkflowImageProps as Type } from './types'

@Component({
  name: 'workflow-image',
  components: {
    StageInstanceWithTimer,
    StatusButton,
    WorkviewImage
  }
})
export default class WorkflowImage extends Vue implements Type {
  @Prop({ required: true, type: Object as () => DatasetItemPayload })
  datasetItem!: DatasetItemPayload

  @State(state => state.workview.selectedDatasetItem)
  selectedDatasetItem!: DatasetItemPayload | null

  get filename (): string {
    return this.datasetItem.filename
  }

  get thumbnail (): string {
    return resolveThumbnail(this.datasetItem)
  }

  get selected (): boolean {
    const { selectedDatasetItem, datasetItem } = this
    return !!selectedDatasetItem && selectedDatasetItem.id === datasetItem.id
  }

  get seq (): number {
    return this.datasetItem.seq
  }

  get instances (): WorkflowStagePayload[] {
    const { datasetItem } = this
    if (!datasetItem || !datasetItem.current_workflow) { return [] }
    const stageNumber = datasetItem.current_workflow.current_stage_number
    return datasetItem.current_workflow.stages[stageNumber]
  }

  get archivedStatus (): boolean {
    return this.datasetItem.status === 'archived'
  }

  get inActiveWorkflow (): boolean {
    const { datasetItem: item } = this
    return !!item.current_workflow_id && !isDefaultAutoComplete(item)
  }

  get isVideo (): boolean {
    const { datasetItem } = this
    return !!(datasetItem.dataset_video && datasetItem.dataset_video.annotate_as_video)
  }

  /**
   * Not the cleanest way to do it, but until we consolidate routes, probably the simplest
   *
   * Infers the route an individual image links to, based on params and query content of the current
   * route.
   */
  get route () {
    const { $route, seq } = this
    const { name, params, query } = $route

    return params.teamSlug
      // open-datasets -> /:team_slug/:dataset_slug/:seq
      ? { name: name, params: { ...params, datasetImageSeq: seq } }
      // workview -> /workview?dataset={dataset_id}&image={seq}
      : { name: name, query: { ...query, image: seq } }
  }
}
</script>

<style lang="scss" scoped>
.workflow-image {
  &:active,
  &:hover,
  &:visited {
    color: inherit;
    text-decoration: none;
  }

  &__status {
    position: absolute;
    width: 20px;
    height: 20px;
    bottom: 4px;
    left: 4px;
    overflow: hidden;
  }

  &__status {
    color: $colorWhite;
  }
}
</style>
