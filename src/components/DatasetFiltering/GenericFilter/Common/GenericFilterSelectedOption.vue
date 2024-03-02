<template>
  <div
    class="generic-filter-selected-option"
    :class="{
      [`generic-filter-selected-option--${status}`]: true
    }"
  >
    <component
      :is="tag"
      :option="option"
    />
    <div
      class="generic-filter-selected-option__remove"
      @click.stop.prevent="$emit('deselect', option)"
    >
      &#10005;
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { GenericFilterOptionType } from '@/components/DatasetFiltering/GenericFilter'
import {
  AssigneeSelectedOption,
  FilenameSelectedOption,
  FolderSelectedOption
} from '@/components/DatasetFiltering/GenericFilter/Common/SelectedOption'
import { TriToggleStatus } from '@/utils'

@Component({
  name: 'generic-filter-selected-option',
  components: {
    AssigneeSelectedOption,
    FilenameSelectedOption,
    FolderSelectedOption
  }
})
export default class GenericFilterSelectedOption extends Vue {
  @Prop({ required: true })
  option!: GenericFilterOptionType

  @Prop({
    type: String as () => TriToggleStatus,
    default: 'none'
  })
  status!: TriToggleStatus

  get tag (): string {
    switch (this.option.type) {
    case 'assignees': return 'assignee-selected-option'
    case 'paths': return 'folder-selected-option'
    default: return 'filename-selected-option'
    }
  }
}
</script>

<style lang="scss" scoped>
.generic-filter-selected-option {
  @include row;
  align-items: center;
  margin: 2px;
  background: $colorAliceBlue;
  padding: 2px 4px;
  border-radius: 3px;

  &--positive {
    border: 1px solid transparent;
  }

  &--negative {
    border: 1px solid $colorCrimson;
  }

  &__remove {
    margin: 0 5px;
    cursor: pointer;
    color: rgba(0, 0, 0, 0.3);

    &:hover { opacity: 0.6; }
    &:active { opacity: 0.4; }
  }
}
</style>
