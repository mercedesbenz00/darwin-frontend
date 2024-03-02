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
import {
  computed,
  defineComponent,
  PropType,
  Ref
} from 'vue'

import { GenericFilterOptionType } from '@/components/DatasetFiltering/GenericFilter'
import {
  AssigneeSelectedOption,
  FilenameSelectedOption,
  FolderSelectedOption
} from '@/components/DatasetFiltering/GenericFilter/V2'
import { TriToggleStatus } from '@/utils'

export default defineComponent({
  name: 'GenericFilterSelectedOption',
  components: {
    AssigneeSelectedOption,
    FilenameSelectedOption,
    FolderSelectedOption
  },
  props: {
    option: {
      required: true,
      type: Object as PropType<GenericFilterOptionType>
    },
    status: {
      type: String as () => TriToggleStatus,
      default: 'none'
    }
  },
  setup (props) {
    const tag: Ref<string> = computed(() => {
      switch (props.option.type) {
      case 'assignees': return 'assignee-selected-option'
      case 'paths': return 'folder-selected-option'
      default: return 'filename-selected-option'
      }
    })

    return {
      tag
    }
  }
})
</script>

<style lang="scss" scoped>
.generic-filter-selected-option {
  @include row;
  align-items: center;
  margin: 2px;
  background: $colorSurfaceDarken;
  padding: 3px;
  border-radius: 6px;

  &--positive {
    border: 1px solid transparent;
  }

  &--negative {
    border: 1px solid $colorCrimson;
  }

  &__remove {
    margin: 0 5px;
    cursor: pointer;
    color: $colorContentSecondary;

    &:hover { opacity: 0.6; }
    &:active { opacity: 0.4; }
  }
}
</style>
