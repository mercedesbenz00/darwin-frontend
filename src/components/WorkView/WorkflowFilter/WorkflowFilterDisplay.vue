<template>
  <div
    role="button"
    class="workflow-filter-display"
    @click="$emit('toggle-expand')"
  >
    <div
      v-if="filterActive"
      role="button"
      class="workflow-filter-display__clear-selection"
      @click.stop="$emit('deselect-all')"
    >
      <status-button
        v-if="singleStatus"
        :type="singleStatus"
        class="workflow-filter-display__clear-selection__default"
      />
      <funnel-icon
        v-else
        class="workflow-filter-display__clear-selection__default"
      />
      <x-icon class="workflow-filter-display__clear-selection__hover" />
    </div>

    <button
      v-else
      class="workflow-filter-display__clear-selection"
      @click.stop="$emit('deselect-all')"
    >
      <sigma-icon />
    </button>
    <span class="workflow-filter-display__label">{{ filteredLabel }}</span>
    <div class="workflow-filter-display__count">
      {{ filteredItemCount }}
    </div>
    <triangle-icon class="workflow-filter-display__expand-toggle" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Getter, State } from 'vuex-class'

import {
  FunnelIcon,
  SigmaIcon,
  TriangleIcon,
  XIcon
} from '@/assets/icons/V1'
import StatusButton from '@/components/WorkView/Common/StatusButton/V1/StatusButton.vue'
import {
  DatasetItemCountsPayload,
  DatasetItemFilter,
  DatasetItemStatus,
  MembershipPayload
} from '@/store/types'
import { getFullName } from '@/utils'

@Component({
  name: 'workflow-filter-display',
  components: {
    FunnelIcon,
    SigmaIcon,
    StatusButton,
    TriangleIcon,
    XIcon
  }
})
export default class WorkflowFilterDisplay extends Vue {
  @State(state => state.workview.datasetItemFilter)
  datasetItemFilter!: DatasetItemFilter

  @State(state => state.workview.datasetItemCounts)
  counts!: DatasetItemCountsPayload | null

  @Getter('relevantTeamMemberships', { namespace: 'team' })
  members!: MembershipPayload[]

  get selectedAnnotationClassIds (): number[] {
    return this.datasetItemFilter.annotation_class_ids || []
  }

  get selectedMembers (): MembershipPayload[] {
    const { datasetItemFilter: { assignees }, members } = this
    if (!assignees) { return [] }
    return members.filter(m => assignees.includes(m.user_id))
  }

  get selectedStatuses (): DatasetItemStatus[] {
    return this.datasetItemFilter.statuses || []
  }

  get selectedTemplates (): number[] {
    return this.datasetItemFilter.workflow_stage_template_ids || []
  }

  get filterActive (): boolean {
    const {
      members,
      selectedAnnotationClassIds,
      selectedMembers,
      selectedStatuses,
      selectedTemplates
    } = this
    if (selectedAnnotationClassIds.length > 0) { return true }
    if (selectedMembers.length > 0 && selectedMembers.length !== members.length) { return true }
    if (selectedStatuses.length > 0 && selectedStatuses.length !== 4) { return true }
    if (selectedTemplates.length > 0) { return true }
    return false
  }

  get filteredItemCount (): number {
    return this.counts ? this.counts.item_count : 0
  }

  get filteredLabel (): string {
    const {
      members,
      selectedAnnotationClassIds,
      selectedMembers,
      selectedStatuses,
      selectedTemplates
    } = this
    const allMembers = selectedMembers.length === members.length || selectedMembers.length === 0
    const allStatuses = selectedStatuses.length === 4 || selectedStatuses.length === 0
    if (
      allMembers &&
      allStatuses &&
      selectedTemplates.length === 0 &&
      selectedAnnotationClassIds.length === 0
    ) { return 'all' }
    if (allStatuses && selectedMembers.length === 1) { return getFullName(selectedMembers[0]) }
    if (allMembers && selectedStatuses.length === 1) { return selectedStatuses[0] }
    return 'filtered'
  }

  /**
   * If the only active filter is a single status, returns that filter, otherwise returns null
   *
   * Used to render a status button icon in place of a funnel when filtering items.
   */
  get singleStatus (): DatasetItemStatus | null {
    const { members, selectedMembers, selectedStatuses } = this
    const allMembers = selectedMembers.length === members.length || selectedMembers.length === 0
    return allMembers && selectedStatuses.length === 1 ? selectedStatuses[0] : null
  }
}
</script>

<style lang="scss" scoped>
.workflow-filter-display {
  cursor: pointer;

  background: $colorAliceBlue;
  color: $colorAliceNight;

  display: grid;
  grid-template-columns: auto 1fr auto auto;
  align-items: center;

  transition: all .2s ease;
  transition-property: background-color;

  // ensures the expand transition is behind this element in vertical order
  // z-index does not work to achieve this, due to using css transforms
  position: relative;
}

.workflow-filter-display__clear-selection {
  margin: 5px 10px;
  padding: 0;
  color: $colorAliceNight;

  grid-column: 1;

  @include row--center;

  background-color: $colorAliceBlue;

  border-radius: 50%;
  height: 20px;
  width: 20px;
  box-shadow: 0px 3px 5px rgba(145, 169, 192, 0.3);

  margin-right: 10px;

  svg {
    height: 60%;
    width: 60%;
  }

  .workflow-filter-display__clear-selection__default {
    width: 100%;
    height: 100%;
    @include row--center;
  }

  .workflow-filter-display__clear-selection__hover {
    width: 10px;
    height: 10px;
    @include row--center;
    color: $colorAliceNight;
  }
  .workflow-filter-display__clear-selection__hover { display: none; }

  &:hover .workflow-filter-display__clear-selection__default { display: none }
  &:hover .workflow-filter-display__clear-selection__hover { display: initial }
}

.workflow-filter-display__label {
  @include noSelect;
  @include typography(md);
  color: $colorAliceNight;
  text-transform: uppercase;
}

.workflow-filter-display__clear-selection .status-button {
  @include workflow-status-background-color;
  color: $colorWhite;
}

.workflow-filter-display__count {
  @include row--center;
  @include typography(md);
  background-color: $colorWhite;
  color: $color90Black;
  text-align: center;
  border-radius: 3px;
  padding: 0 5px;
  justify-self: right;
  margin-right: 5px;
  user-select: none;
}

.workflow-filter-display__expand-toggle {
  color: $colorAliceNight;
  width: 30px;

  transition: all .2s ease;
  transition-property: transform;
}
</style>
