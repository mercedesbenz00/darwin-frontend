<template>
  <div
    v-if="pageCount > 0"
    class="pagination"
    :style="wrapperStyle"
  >
    <icon-button
      v-tooltip="prevTooltip"
      :disabled="page <= 1"
      color="transparent"
      size="mini"
      flair="super-soft"
      class="pagination__button pagination__button pagination__button pagination__button__prev"
      aria-label="previous"
      @click="$emit('prev')"
    >
      <chevron-right-icon
        v-if="arrow"
        class="pagination__button__icon--arrow"
      />
      <icon-mono-chevron
        v-else
        class="pagination__button__icon"
      />
    </icon-button>
    <div class="pagination__content">
      <!-- During load, pageCount and page are both zero, to supress
      ff's red error rectangle we temporarily set min to 0 -->
      <!-- pattern [0-9]+ disallow the usage of dot symbol -->
      <input
        ref="input"
        v-model="inputValue"
        v-input-auto-blur="true"
        class="pagination__content__input"
        type="number"
        :style="inputStyle"
        :min="pageCount == 0 ? 0 : 1"
        :max="pageCount"
        step="1"
        @keydown.up.stop="onKeyArrowUp"
        @keydown.down.stop="onKeyArrowDown"
        @keypress="preventDot"
        @input="onInput"
        @blur="onBlur"
        @focus="$event.target.select()"
      >
      <span class="pagination__content__page-separator">/</span>
      <span class="pagination__content__page-count">{{ pageCount }}</span>
    </div>
    <icon-button
      v-tooltip="nextTooltip"
      :disabled="page >= pageCount"
      color="transparent"
      size="mini"
      flair="super-soft"
      class="pagination__button pagination__button pagination__button pagination__button__next"
      aria-label="next"
      @click="$emit('next')"
    >
      <chevron-right-icon
        v-if="arrow"
        class="pagination__button__icon--arrow"
      />
      <icon-mono-chevron
        v-else
        class="pagination__button__icon"
      />
    </icon-button>
  </div>
</template>
<script lang="ts">
import {
  computed,
  defineComponent,
  ref,
  Ref,
  SetupContext,
  watch
} from 'vue'

import { ChevronRightIcon } from '@/assets/icons/V1'
import { IconMonoChevron } from '@/assets/icons/V2/Mono'
import { IconButton } from '@/components/Common/Button/V2'
import { useHotkey } from '@/composables'
import { TooltipOptions } from '@/types'

/**
 * # Events emitted by this component
 *
 * - `next` - user clicked right arrow OR user pushed `>` key
 * - `prev` - user clicked left arrow OR user pushed `<` key
 * - `next-secondary` - user pushed `,` key
 * - `prev-secondary` - user pushed `.` key
 *
 * When changing logic here, make sure events on parent components are correctly
 * bound. This documentation was added due to issues with the following components
 * being bound incorrectly:
 *
 * - `WorkflowPagination.vue`
 * - `VideoAnnotationsPagination.vue`
 */
export default defineComponent({
  name: 'ChevronPagination',
  components: { IconButton, ChevronRightIcon, IconMonoChevron },
  props: {
    page: { default: null, type: Number },
    pageCount: { required: true, type: Number },
    prev: { required: true, type: String },
    next: { required: true, type: String },
    arrow: { default: false, type: Boolean },
    dynamicWidth: { default: false, type: Boolean }
  },
  setup (props, { emit }: SetupContext) {
    const input = ref<HTMLDivElement>()
    const inputValue: Ref<number> = ref(1)

    const inputWidth = computed((): number => {
      if (!props.dynamicWidth) { return (props.pageCount?.toString().length * 8) + 16 }
      if (!inputValue.value) { return 16 }
      return (inputValue.value?.toString().length * 8) + 16
    })

    const inputStyle = computed((): Partial<{ [key in keyof CSSStyleDeclaration]: string }> => {
      return { width: `${inputWidth.value}px` }
    })

    const wrapperStyle = computed((): Partial<{ [key in keyof CSSStyleDeclaration]: string }> => {
      const button = 24
      const separator = 16
      return { minWidth: `${(button * 2) + separator + (inputWidth.value)}px` }
    })

    const prevTooltip = computed((): TooltipOptions => {
      return {
        content: props.prev,
        placement: 'bottom',
        classes: 'tooltip--chervron-pagination',
        delay: { show: 300, hide: 300 }
      }
    })

    const nextTooltip = computed((): TooltipOptions => {
      return {
        content: props.next,
        placement: 'bottom',
        classes: 'tooltip--chervron-pagination',
        delay: { show: 300, hide: 300 }
      }
    })

    const shouldEmitPrev = computed(() => props.page > 1)
    const shouldEmitNext = computed(() => props.page < props.pageCount)

    const preventDot = (evt: KeyboardEvent): boolean => {
      if (evt.key === '.') { evt.preventDefault() }
      return evt.key !== '.'
    }

    const getValue = (evt: Event): number => {
      const input = evt.target as HTMLInputElement
      return parseInt(input.value)
    }

    const onKeyArrowDown = (): void => {
      if (shouldEmitPrev.value) { emit('prev') }
    }

    const onKeyArrowUp = (): void => {
      if (shouldEmitNext.value) { emit('next') }
    }

    const onInput = (evt: Event): void => {
      const value = getValue(evt)
      if (!evt || value === inputValue.value || isNaN(value) || value < 1) {
        return
      } else if (value > props.pageCount) {
        inputValue.value = props.pageCount
      }
      emit('page', inputValue.value)
    }

    const onBlur = (evt: Event): void => {
      const value = getValue(evt)
      if (isNaN(value) || value < 1) {
        inputValue.value = props.page
      } else if (value > props.pageCount) {
        inputValue.value = props.pageCount
      }
    }

    useHotkey({
      handler: () => { if (shouldEmitPrev.value) { emit('prev-secondary') } },
      key: ',',
      name: 'Chevron pagination, navigate to next pageas secondary'
    })
    useHotkey({
      handler: () => { if (shouldEmitNext.value) { emit('next-secondary') } },
      key: '.',
      name: 'Chevron pagination, navigate to next page as secondary'
    })
    useHotkey({
      handler: () => { if (shouldEmitPrev.value) { emit('prev') } },
      key: '<',
      name: 'Chevron pagination, navigate to next page'
    })
    useHotkey({
      handler: () => { if (shouldEmitNext.value) { emit('next') } },
      key: '>',
      name: 'Chevron pagination, navigate to next page'
    })

    watch(() => props.page, (val: number) => {
      if (inputValue.value !== val) { inputValue.value = val }
    }, { immediate: true })

    return {
      input,
      inputValue,
      inputWidth,
      wrapperStyle,
      inputStyle,
      prevTooltip,
      nextTooltip,
      preventDot,
      getValue,
      onKeyArrowDown,
      onKeyArrowUp,
      onInput,
      onBlur
    }
  }
})
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.tooltip--chervron-pagination {
  .tooltip-inner {
    @include row--center;
    height: 36px;
  }
}
</style>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.pagination {
  @include row--center;

  &__content {
    @include row--center;
    align-items: center;

    &__input {
      @include typography(lg-1, inter, 500);
      background-color: transparent;
      border-radius: 6px;
      text-align: center;
      color: $colorContentEmphasis;
      white-space: nowrap;
      appearance: textfield;
      -moz-appearance: textfield;
      transition: all .150s linear;

      /* Chrome, Safari, Edge, Opera */
      &::-webkit-outer-spin-button,
      &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }

      &::selection {
          background-color: $colorOverlayInteractive;
      }

      /* For Mozilla Firefox */
      &::-moz-selection {
          background-color: $colorOverlayInteractive;
      }

      &:hover {
        background-color: $colorOverlayHover;
      }

      &:active,
      &:focus {
        @include noSelect;
        background-color: $colorOverlayPressed;
        caret-color: $colorInteractivePrimaryDefault;
        outline: none;
      }
    }

    &__page-separator,
    &__page-count {
      @include typography(lg-1, inter, 500);
      color: $colorContentTertiary;
      cursor: default;
    }

    &__page-separator {
      margin: 0 10px 0 2px;
    }
  }

  &__button {
    color: $colorContentTertiary;

    .pagination__button__icon {
      color: $colorContentTertiary;

      path {
        fill: $colorContentTertiary;
      }

      &--arrow {
        color: $colorContentTertiary;

        path {
          fill: none;
        }
      }
    }

    &__prev {
      .pagination__button__icon {
        transform: rotate(90deg);

        &--arrow {
          transform: rotate(180deg);
        }
      }
    }

    &__next {
      .pagination__button__icon {
        transform: rotate(-90deg);
        margin-left: 2px;

        &--arrow {
          transform: rotate(0deg);
        }
      }
    }

    &:disabled,
    &[disabled] {
      .pagination__button__icon {
        color: $colorContentDisabled;

        path {
          fill: $colorContentDisabled;
        }

        &--arrow {
          color: $colorContentTertiary;

          path {
            fill: none;
          }
        }
      }
    }
  }
}
</style>
