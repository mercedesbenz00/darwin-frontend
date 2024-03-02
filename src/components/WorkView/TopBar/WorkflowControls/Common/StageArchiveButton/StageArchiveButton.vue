<template>
  <div
    v-tooltip="tooltip"
    class="stage-archive"
  >
    <icon-button
      v-if="icon"
      class="archive-button"
      :class="{'archive-button--active': isArchived}"
      :variant="isArchived ? 'default' : 'outline'"
      size="small"
      :color="isArchived ? 'negative' : 'secondary'"
      flair="rounded"
      @click="onClick"
    >
      <icon-duotone-trash-inverted v-if="isArchived" />
      <icon-duotone-trash v-else />
    </icon-button>
    <custom-button
      v-else
      class="archive-button"
      :class="{'archive-button--active': isArchived}"
      :variant="isArchived ? 'default' : 'outline'"
      size="small"
      :color="isArchived ? 'negative' : 'secondary'"
      flair="rounded"
      @click="onClick"
    >
      {{ isArchived ? 'Archived' : 'Archive' }}
    </custom-button>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { IconDuotoneTrash, IconDuotoneTrashInverted } from '@/assets/icons/V2/Duotone'
import { CustomButton, IconButton } from '@/components/Common/Button/V2'
import { assignStage } from '@/store/modules/workview/actions/assignStage'
import {
  StoreActionPayload,
  UserPayload,
  WorkflowStagePayload
} from '@/store/types'
import { TooltipOptions } from '@/types'

/**
 * The "trash" button available to item assignee when the item is in "review" stage
 *
 * It sets stage to "archived" review status and toggles auto-completion of stage
 */
@Component({
  name: 'stage-archive-button',
  components: {
    CustomButton,
    IconButton,
    IconDuotoneTrash,
    IconDuotoneTrashInverted
  }
})
export default class StageArchiveButton extends Vue {
  @Prop({ default: true, type: Boolean as () => boolean })
  icon!: boolean

  @State(state => state.workview.selectedStageInstance)
  stage!: WorkflowStagePayload

  @State(state => state.user.profile)
  user!: UserPayload

  get isArchived (): boolean {
    return this.stage.metadata.review_status === 'archived'
  }

  get tooltip (): TooltipOptions {
    return {
      content: this.isArchived
        ? 'Cancel archival of image'
        : 'Archive image',
      delay: { show: 300, hide: 300 }
    }
  }

  onClick (): void {
    this.isArchived
      ? this.reset()
      : this.archive()
  }

  async reset (): Promise<void> {
    const { error } = await this.$store.dispatch('workview/resetStageReviewStatus', this.stage)
    if (error) { this.$toast.warning({ extended: false, meta: { title: error.message } }) }
  }

  async archive (): Promise<void> {
    const { stage, user } = this

    if (!stage.assignee_id) {
      const { id: userId } = user
      const payload: StoreActionPayload<typeof assignStage> = { stage, userId }
      const { error } = await this.$store.dispatch('workview/assignStage', payload)
      if (error) { return this.$store.dispatch('toast/warning', { content: error.message }) }
    }

    const { error } = await this.$store.dispatch('workview/archiveStage', this.stage)
    if (error) { this.$toast.warning({ extended: false, meta: { title: error.message } }) }
  }
}
</script>
