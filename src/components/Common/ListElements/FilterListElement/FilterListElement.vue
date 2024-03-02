<template>
  <button
    :id="`fle_${meta.id}`"
    class="fle"
    :class="`fle--${status}`"
    @click="onFilter"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <div class="fle__wrapper">
      <div
        class="fle-icon__wrapper"
        v-if="!!$slots['prefixIcon']"
      >
        <slot name="prefixIcon" />
      </div>
      <p class="fle__label">
        {{ meta.label }}
      </p>
      <span class="fle__count">{{ meta.count }}</span>
    </div>
    <div
      class="fle-icon__wrapper"
      v-if="!!$slots['suffixIcon']"
    >
      <slot name="suffixIcon" />
    </div>
  </button>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'

import { StatusFilterItemTypeV2 } from '@/components/DatasetFiltering/types'
import { TriToggleStatusV2 } from '@/utils'

/**
 * @Component FilterListElement
 * ~ Component mostly used in filter lists. Should support a badge to display, an icon
 * (prefix/suffix) and label
 * @param {string} label
 * @param {Number} count
 * @param {TriToggleStatusV2} status
 * */

const statusValidator = (value: TriToggleStatusV2): boolean =>
  Object.values(TriToggleStatusV2).includes(value)

const NEXT_VALUE = {
  [TriToggleStatusV2.NONE]: TriToggleStatusV2.POSITIVE,
  [TriToggleStatusV2.POSITIVE]: TriToggleStatusV2.NEGATIVE,
  [TriToggleStatusV2.NEGATIVE]: TriToggleStatusV2.NONE
}

const defaultColor = {
  r: 113,
  g: 122,
  b: 132,
  a: 1
}
const positiveColor = {
  r: 35,
  g: 89,
  b: 251,
  a: 1
}
const negativeColor = {
  r: 220,
  g: 24,
  b: 24,
  a: 1
}

export default defineComponent({
  name: 'FilterListElement',
  props: {
    status: {
      type: String as () => TriToggleStatusV2,
      required: true,
      validator: statusValidator
    },
    meta: {
      type: Object as () => StatusFilterItemTypeV2,
      required: true
    }
  },
  setup (props, { emit }) {
    const onFilter = (): void => {       
      const status = NEXT_VALUE[props.status]
      emit('change', status)
    }

    const badgeColor = computed(() => {
      if (props.status === TriToggleStatusV2.POSITIVE) {
        return positiveColor
      }
      
      if (props.status === TriToggleStatusV2.NEGATIVE) {
        return negativeColor
      }

      return defaultColor
    })

    return { onFilter, badgeColor, props }
  }
})
</script>

<style lang="scss" scoped>
.fle {
  transition: background-color 150ms ease;

  display: inline-flex;
  align-items: center;
  justify-content: space-between;

  border-radius: 8px;

  width: 100%;
  height: auto;

  padding: 5px 6px;
  margin: 0;

  &--none {
    background-color: transparent;

    &:hover {
      background-color: $colorOverlayHover;
    }
  }

  &--positive {
    background-color: $colorOverlayInteractive;

    &:deep(p) {
      color: $colorContentEmphasis;
    }

    .fle__count {
      color: $colorContentEmphasis;
    }
  }

  &--negative {
    background-color: $colorSolidNegative;

    &:deep(p) {
      text-decoration-line: line-through;
      color: $colorContentEmphasis;
    }

    .fle__count {
      color: $colorContentEmphasis;
    }
  }
}

.fle__wrapper {
  display: flex;
  width: 100%;
  grid-template-columns: 20px 1fr auto;
  align-items: center;
  grid-gap: 4px;
}

.fle__label {
  transition: color 150ms ease;
  @include typography(md, inter, 500);
  text-align: left;

  @include ellipsis(1, md);
  width: 100%;

  color: $colorContentDefault;
  margin-right: 2px;
}

.fle__count {
  @include typography(md, inter, 500);
  color: $colorContentTertiary;
}

.fle-icon__wrapper {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 20px;
  height: 20px;
}
</style>
