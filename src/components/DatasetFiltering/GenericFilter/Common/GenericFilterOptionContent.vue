<template>
  <rounded-tri-toggle-button
    class="generic-filter-option-content"
    :status.sync="_status"
    @toggle="onToggleStatusChange"
  >
    <component
      :is="tag"
      :option="option"
    />
  </rounded-tri-toggle-button>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

import RoundedTriToggleButton from '@/components/Common/Button/V1/RoundedTriToggleButton/RoundedTriToggleButton.vue'
import { GenericFilterOptionType } from '@/components/DatasetFiltering/GenericFilter'
import {
  AssigneeOption,
  FilenameOption,
  FolderOption
} from '@/components/DatasetFiltering/GenericFilter/Common/Option'
import { TriToggleStatus } from '@/utils'

@Component({
  name: 'generic-filter-option-content',
  components: {
    AssigneeOption,
    FilenameOption,
    FolderOption,
    RoundedTriToggleButton
  }
})
export default class GenericFilterOptionContent extends Vue {
  @Prop({ required: true })
  option!: GenericFilterOptionType

  @Prop({
    type: String as () => TriToggleStatus,
    default: 'none'
  })
  status!: TriToggleStatus

  _status: TriToggleStatus = 'none'

  get tag (): string {
    switch (this.option.type) {
    case 'assignees': return 'assignee-option'
    case 'filenames': return 'filename-option'
    case 'paths': return 'folder-option'
    }
  }

  @Watch('status', { immediate: true })
  onStatus (): void { this._status = this.status }

  async onToggleStatusChange (event: MouseEvent): Promise<void> {
    await this.$nextTick()
    if (event.shiftKey) {
      this.$emit('shift-toggle', this._status)
    } else {
      this.$emit('toggle', this._status)
    }
  }
}
</script>

<style lang="scss" scoped>
.generic-filter-option-content {
  width: calc(100% - 10px);
  margin: 0 5px 0 5px;
}
</style>
