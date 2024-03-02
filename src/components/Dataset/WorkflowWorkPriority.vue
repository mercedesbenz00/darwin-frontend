<template>
  <div class="workflow-work-priority">
    <div class="workflow-work-priority__label">
      <label>Set new tasks by</label>
      <info>When a user requests a batch of tasks, send them by this order.</info>
    </div>
    <div class="workflow-work-priority__input">
      <sort-dropdown
        :value="sortBy"
        :direction="sortDirection"
        :options="sortOptions"
        @change="onSortChange($event, 'by')"
        @change-direction="onSortChange($event, 'direction')"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import Info from '@/components/Common/Info.vue'
import SortDropdown from '@/components/Common/SortDropdown/V1/SortDropdown.vue'

@Component({
  name: 'workflow-work-priority',
  components: { Info, SortDropdown }
})
export default class WorkflowWorkPriority extends Vue {
  @Prop({ required: true })
  value!: string

  get sortBy () {
    return this.value.split(':')[0]
  }

  get sortDirection () {
    return this.value.split(':')[1]
  }

  get sortOptions () {
    return [{
      text: 'Date added',
      icon: '/static/imgs/sort/date-created.svg',
      id: 'inserted_at'
    }, {
      text: 'Priority',
      icon: '/static/imgs/sort/priority.svg',
      id: 'priority'
    }]
  }

  onSortChange (val: string, type: 'by' | 'direction') {
    const newSortBy = type === 'by' ? val : this.sortBy
    const newSortDirection = type === 'direction' ? val : this.sortDirection
    this.$emit('input', `${newSortBy}:${newSortDirection}`)
  }
}
</script>

<style lang="scss" scoped>
.workflow-work-priority {
  width: 100%;
  @include row--distributed;
  align-items: center;
}

.workflow-work-priority__label {
  @include row;
  @include typography(md-1);
  color: $colorSecondaryDark1;
  flex: 3;
}

.workflow-work-priority__label label {
  margin-right: 15px;
}

.workflow-work-priority__input {
  width: 200px;

  :deep(.inputfield__input) {
    background: $colorSecondaryLight2 !important;
  }
}
</style>
