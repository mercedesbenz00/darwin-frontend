<template>
  <div class="tag-applier__create">
    <custom-button
      class="tag-applier__create__button"
      color="transparent"
      size="small"
      flair="rounded"
      @click="$emit('create', keyword)"
    >
      {{ add ? 'Add' : 'Create' }}
      <badge
        class="tag-applier__create__button__badge"
        :label="keyword"
        :color="primaryColor"
        size="medium"
        no-capitalize
      />
    </custom-button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { Badge } from '@/components/Common/Badge'
import { CustomButton } from '@/components/Common/Button/V2'
import { primary } from '@/utils'

export default defineComponent({
  name: 'TagApplierCreate',
  components: { CustomButton, Badge },
  props: {
    keyword: { type: String, default: '' },
    add: { type: Boolean, default: false }
  },
  setup () {
    const primaryColor = primary()

    return {
      primaryColor
    }
  }
})
</script>

<style lang="scss" scoped>
.tag-applier__create {
  position: relative;
  @include row--center;
  align-items: center;
  width: 100%;
  height: 48px;
  padding: 8px;
  bottom: 0;
  border-top: 1px solid $colorBorderLight;

  &__button__badge {
    max-width: 160px !important;

    &:deep(.badge__content__label) {
      @include ellipsis(1, md);
      font-weight: 700;
    }
  }

  &:deep(.custom-button__label) {
    @include row--center;
    align-items: center;
    gap: 4px;
    color: $colorInteractivePrimaryDefault;

    &:disabled {
      color: $colorInteractivePrimaryDisabled;
    }

    &:hover {
      color: $colorInteractivePrimaryHover;
    }

    &:active,
    &:focus {
      color: $colorInteractivePrimaryPressed;
    }
  }
}
</style>
