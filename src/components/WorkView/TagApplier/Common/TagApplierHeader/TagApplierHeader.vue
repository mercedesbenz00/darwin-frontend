<template>
  <div class="tag-applier__header">
    <div class="tag-applier__header__first">
      <div class="tag-applier__header__title">
        <icon-mono-tag class="tag-applier__header__title__icon" />
        <span class="tag-applier__header__title__label">Tags</span>
      </div>
      <sort-button
        class="tag-applier__header__sort"
        :direction="direction"
        :disabled="disabled"
        @change="onChangeDirection"
      />
    </div>
    <span
      v-if="disabled"
      class="tag-applier__header__subtitle"
    >
      You can't add tags on completed stages
    </span>
    <span
      v-else
      class="tag-applier__header__subtitle"
    >
      Select a tag or type a new one below
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent, SetupContext, PropType } from 'vue'

import { IconMonoTag } from '@/assets/icons/V2/Mono'
import { SortButton } from '@/components/Common/SortButton/V2'

export default defineComponent({
  name: 'TagApplierHeader',
  components: { SortButton, IconMonoTag },
  props: {
    direction: { type: String as PropType<'asc' | 'desc'>, default: 'asc' },
    disabled: { type: Boolean, default: false }
  },
  setup (props, { emit }: SetupContext) {
    const onChangeDirection = (): void => {
      emit('change:direction', props.direction === 'asc' ? 'desc' : 'asc')
    }

    return {
      onChangeDirection
    }
  }
})
</script>

<style lang="scss" scoped>
.tag-applier__header {
  @include col;
  gap: 4px;
  padding: 8px;
  height: 60px;

  &__first {
    @include row--distributed;
    align-items: center;
  }

  &__title {
    @include row;
    align-items: center;
    gap: 4px;
    @include typography(lg, inter, 500);
    color: $colorContentDefault;
  }

  &__subtitle {
    @include typography(md, inter, 500);
    color: $colorContentTertiary;
  }
}
</style>
