<template>
  <div
    v-tooltip="tooltip"
    class="more-work"
  >
    <custom-button
      class="more-work__button"
      :class="{'more-work__button--loading': loading}"
      size="large"
      :disabled="disabled"
      full-width
      @click="requestWork"
    >
      <span v-if="loading">Fetching Images...</span>
      <span v-else>More Work</span>
    </custom-button>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { CustomButton } from '@/components/Common/Button/V2'
import {
  DatasetPayload,
  DatasetItemCountsPayload,
  DatasetStatusCountsPayload
} from '@/store/types'
import { TooltipOptions } from '@/types'

@Component({ name: 'more-work', components: { CustomButton } })
export default class NewBatch extends Vue {
  @State(state => state.workview.dataset)
  dataset!: DatasetPayload

  @State(state => state.workview.datasetItemCounts)
  counts!: DatasetItemCountsPayload | null

  loading: boolean = false

  get disabled (): boolean {
    const { loading, counts } = this
    if (!Array.isArray(counts?.status_counts)) { return true }
    const statusNew = counts?.status_counts
      .find((item: DatasetStatusCountsPayload) => item.status === 'new')
    const statusAnnotate = counts?.status_counts
      .find((item: DatasetStatusCountsPayload) => item.status === 'annotate')
    return loading || statusNew?.count !== 0 || statusAnnotate?.count !== 0
  }

  get tooltip (): TooltipOptions {
    return {
      content: this.disabled
        ? 'Finish your currently assigned work to request more'
        : 'Request more work ',
      placement: 'top',
      delay: { show: 300, hide: 300 }
    }
  }

  async requestWork (): Promise<void> {
    this.loading = true
    const { data } = await this.$store.dispatch('workview/requestWork', this.dataset)
    if (data && data.length === 0) {
      this.$store.dispatch(
        'toast/notify',
        { content: 'There are no more items available to work on.' }
      )
    }
    this.loading = false
  }
}
</script>

<style lang="scss" scoped>
.more-work {
  @include col--center;
  width: 140px;
  max-height: calc(100% - 1px);
  height: 52px;
  margin-left: 4px;

  &__button {
    height: 100%;
    @include typography(md-1, headlines, 800);

    &--loading {
      white-space: normal;
    }
  }
}
</style>
