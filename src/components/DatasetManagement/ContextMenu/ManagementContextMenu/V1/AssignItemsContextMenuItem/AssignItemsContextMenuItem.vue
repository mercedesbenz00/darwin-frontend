<template>
  <v-popover
    placement="top"
    trigger="click"
    popover-class="assign-items__popover"
    :disabled="assigning || disabled"
    :offset="1"
  >
    <gallery-context-menu-item
      class="assign-items-context-menu-item"
      label="Assign"
      :disabled="assigning || disabled"
      :tooltip="tooltip"
    >
      <assign-items-icon />
    </gallery-context-menu-item>
    <template #popover>
      <member-selection
        class="assign-items__popover_content"
        @select="assignItems"
      />
    </template>
  </v-popover>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { State, Getter } from 'vuex-class'

import { AssignItemsIcon } from '@/assets/icons/V1'
import GalleryContextMenuItem from '@/components/Common/Gallery/GalleryContextMenuItem.vue'
import MemberSelection from '@/components/DatasetManagement/ContextMenu/ManagementContextMenu/V1/MemberSelection/MemberSelection.vue'
import { assignItems } from '@/store/modules/dataset/actions/assignItems'
import {
  DatasetItemPayload,
  DatasetItemStatus,
  DatasetPayload,
  MembershipPayload,
  RootState,
  StoreActionPayload,
  WorkflowTemplatePayload,
  StageType,
  StoreActionResponse,
  DatasetItemFilter
} from '@/store/types'
import { ErrorCodes } from '@/utils/error/errors'

@Component({
  name: 'assign-items-context-menu-item',
  components: { AssignItemsIcon, GalleryContextMenuItem, MemberSelection }
})
export default class AssignItemsContextMenuItem extends Vue {
  @Prop({ required: true, type: Object as () => DatasetPayload })
  dataset!: DatasetPayload

  @Prop({ required: true, type: Object as () => DatasetItemFilter })
  filter!: DatasetItemFilter

  @State((state: RootState) => {
    const { datasetItems, selectedItemIds } = state.dataset
    return datasetItems.filter(i => selectedItemIds.includes(i.id))
  })
  selectedItems!: DatasetItemPayload[]

  assigning: boolean = false

  get tooltip (): string | null {
    const { selectedItems, hasVideoFrames, hasProcessingItems, hasUnassignableItems } = this

    if (selectedItems.length === 0) {
      return 'Select some items before assigning.'
    }

    if (hasVideoFrames) {
      return 'Cannot assign videos directly. Please open the video and assign the frames.'
    }

    if (hasProcessingItems) {
      return 'Cannot assign. Some of the selected items are uploading or processing.'
    }

    if (hasUnassignableItems) {
      return 'Cannot assign. First stage of new workflow is not assignable.'
    }

    return null
  }

  get disabled (): boolean {
    const { selectedItems, hasVideoFrames, hasProcessingItems, hasUnassignableItems } = this
    return (
      selectedItems.length === 0 ||
      hasVideoFrames ||
      hasProcessingItems ||
      hasUnassignableItems
    )
  }

  get hasVideoFrames (): boolean {
    const { selectedItems } = this
    return selectedItems.some(i =>
      i.dataset_video_id !== null &&
      i.dataset_video &&
      !i.dataset_video.annotate_as_video
    )
  }

  get hasProcessingItems (): boolean {
    const { selectedItems } = this
    return selectedItems.some(i =>
      [DatasetItemStatus.processing, DatasetItemStatus.uploading].includes(i.status)
    )
  }

  @Getter('defaultWorkflowTemplate', { namespace: 'dataset' })
  getDefaultWorkflowTemplate!: (dataset: DatasetPayload) => WorkflowTemplatePayload | undefined

  get defaultWorkflowTemplate (): WorkflowTemplatePayload | undefined {
    return this.getDefaultWorkflowTemplate(this.dataset)
  }

  get hasUnassignableItems (): boolean {
    const { defaultWorkflowTemplate, selectedItems } = this
    if (!defaultWorkflowTemplate) { return true }

    const requiresNewWorkflows = selectedItems.some(
      i => i.status === DatasetItemStatus.new || i.status === DatasetItemStatus.complete
    )
    if (!requiresNewWorkflows) { return false }

    const firstTemplate =
      defaultWorkflowTemplate.workflow_stage_templates.find(s => s.stage_number === 1)

    if (!firstTemplate) { throw new Error('Dataset default workflow has invalid template') }
    return !(firstTemplate.type === StageType.Annotate || firstTemplate.type === StageType.Review)
  }

  async assignItems (assignee: MembershipPayload): Promise<void> {
    const { dataset, filter } = this

    this.assigning = true

    const payload: StoreActionPayload<typeof assignItems> = { assignee, filter, dataset }

    const response: StoreActionResponse<typeof assignItems> =
      await this.$store.dispatch('dataset/assignItems', payload)

    this.assigning = false

    if ('error' in response) {
      const { error } = response

      if (error.code === ErrorCodes.OUT_OF_SUBSCRIBED_STORAGE) {
        return this.$store.commit('billing/SHOW_OUT_OF_STORAGE_DIALOG')
      }

      const content = error.backendMessage || error.message
      return this.$store.dispatch('toast/warning', { content })
    }

    this.$store.dispatch('toast/notify', { content: 'Items successfully assigned' })
    this.deselectAll()
  }

  deselectAll (): void {
    this.$store.commit('dataset/SET_SELECTED_ALL_ITEMS', false)
  }
}
</script>

<style lang="scss" scoped>
$popover-width: 220px;

.assign-items-context-menu-item {
  height: 100%;
}

.assign-items-context-menu-item :deep(svg) {
  color: $colorBlack;
}

.assign-items-context-menu-item:disabled :deep(svg) {
  color: rgba($colorBlack, 0.3);
}

.assign-items__popover_content {
  width: $popover-width;
}
</style>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
@import '../popover';

.assign-items__popover {
  @include assign-popover(220px);
}
</style>
