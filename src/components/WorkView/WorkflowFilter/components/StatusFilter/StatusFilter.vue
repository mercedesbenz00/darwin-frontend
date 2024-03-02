<template>
  <status-filter
    class="workflow-filter__statuses"
    show-all
    :all-count="allStatusCount"
    :options="filterStatusOptions"
    :options-to-hide="[]"
    :commented="commented"
    :positive-options="positiveStatuses"
    :negative-options="negativeStatuses"
    @change="onSelectedStatusChange"
  />
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import StatusFilter from '@/components/DatasetFiltering/StatusFilter/V1/StatusFilter.vue'
import { StatusFilterItemTypeV2 } from '@/components/DatasetFiltering/types'
import { DatasetItemStatus, DatasetItemCountsPayload } from '@/store/types'

type FilterableStatus =
  DatasetItemStatus.new |
  DatasetItemStatus.annotate |
  DatasetItemStatus.review |
  DatasetItemStatus.complete |
  DatasetItemStatus.webhook

const resolveCount =
  (key: FilterableStatus | 'all', counts: DatasetItemCountsPayload | null): number => {
    if (!counts) { return 0 }
    const count = counts.status_counts.find(c => c.status === key)
    return count ? count.count : 0
  }

const STATUSES: FilterableStatus[] = [
  // order of items here determines render order
  DatasetItemStatus.new,
  DatasetItemStatus.annotate,
  DatasetItemStatus.review,
  DatasetItemStatus.complete,
  DatasetItemStatus.webhook
]

const LABELS: {[k in FilterableStatus]: string} = {
  complete: 'Complete',
  new: 'New',
  annotate: 'Annotate',
  review: 'Review',
  webhook: 'Webhook'
}

const ICONS: { [k in FilterableStatus]: string } = {
  complete: '/static/imgs/image-status-v2/completed.svg',
  new: '/static/imgs/image-status-v2/new.svg',
  annotate: '/static/imgs/image-status-v2/annotate.svg',
  review: '/static/imgs/image-status-v2/review.svg',
  webhook: '/static/imgs/image-status-v2/webhook.svg'
}

@Component({
  name: 'workflow-filter-status-filter',
  components: { StatusFilter }
})
export default class WorkflowSidebarStatusFilter extends Vue {
  @Prop({ required: false, default: () => [] })
  positiveStatuses!: DatasetItemStatus[]

  @Prop({ required: false, default: () => [] })
  negativeStatuses!: DatasetItemStatus[]

  @Prop({ required: false, type: Boolean, default: false })
  commented!: boolean

  @State(state => state.workview.datasetItemCounts)
  counts!: DatasetItemCountsPayload | null

  get commentOption (): StatusFilterItemTypeV2 {
    const { counts } = this
    return {
      id: 'commented',
      label: 'Commented',
      icon: '/static/imgs/image-status-v2/comment.svg',
      count: counts ? counts.commented_item_count : null,
      omitFromAllSelected: true
    }
  }

  /**
   * Options listed in the dropdown
   *
   * Order is important here, so DO NOT sort them alphabetically
   */
  get filterStatusOptions (): StatusFilterItemTypeV2[] {
    const { counts } = this

    const options: StatusFilterItemTypeV2[] = STATUSES.map(key => {
      return {
        id: key,
        label: LABELS[key],
        icon: ICONS[key],
        count: resolveCount(key, counts),
        omitFromAllSelected: false
      }
    })

    options.push(this.commentOption)

    return options
  }

  get allStatusCount (): number {
    return this.counts ? this.counts.item_count : 0
  }

  onSelectedStatusChange (evt: {
    positiveOptions: (DatasetItemStatus | 'commented')[],
    negativeOptions: DatasetItemStatus[]
  }): void {
    const positiveStatuses = evt.positiveOptions.filter(status => status !== 'commented')
    const commented = evt.positiveOptions.includes('commented')
    this.$emit('update:positive-statuses', positiveStatuses)
    this.$emit('update:negative-statuses', evt.negativeOptions)
    this.$emit('update:commented', commented)
    this.$emit('change', evt)
  }
}
</script>

<style lang="scss" scoped>
.workflow-filter__statuses {
  width: 100%;
}
</style>
