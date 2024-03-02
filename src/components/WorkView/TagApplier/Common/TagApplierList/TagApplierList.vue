<template>
  <div class="tag-applier__list">
    <recycle-scroller
      ref="recycleScroller"
      v-if="itemsLength"
      class="tag-applier__list__content"
      :buffer="buffer"
      :item-size="itemHeight"
      :items="parsedItems"
      direction="vertical"
      key-field="label"
      emit-update
      @resize="onResize"
      @update="onUpdate"
    >
      <template #default="{ item, index }">
        <list-element-v2
          v-tooltip="{
            content: `Add '${item.label}' tag annotation`
          }"
          tabindex="1"
          :selected="focused && selectedIdx === Number(index)"
          @click="$emit('create', item.label)"
        >
          <badge
            :label="item.label"
            :color="item.color"
            size="medium"
            :high-contrast="focused && selectedIdx === Number(index)"
            no-capitalize
            no-tooltip
          />
          <keycap
            v-if="focused && selectedIdx === Number(index)"
            size="small"
          >
            ↵
          </keycap>
        </list-element-v2>
      </template>
    </recycle-scroller>
    <span
      v-else
      class="tag-applier__list__no-content"
    >
      <span
        v-if="duplicate"
        class="tag-applier__list__no-content__new-badge"
      >
        Tag {{ keyword }} already exists
      </span>
      <span
        v-else-if="keyword"
        class="tag-applier__list__no-content__new-badge"
      >
        Tag {{ keyword }} not available
      </span>
      <span v-else>No tags available</span>
    </span>
  </div>
</template>

<script lang="ts">
import { sortBy } from 'lodash'
import {
  defineComponent,
  computed,
  PropType,
  ref,
  Ref,
  SetupContext,
  watch
} from 'vue'
import { RecycleScroller } from 'vue-virtual-scroller'

import { Badge, BadgeType } from '@/components/Common/Badge'
import Keycap from '@/components/Common/Keycap/Keycap.vue'
import ListElementV2 from '@/components/Common/ListElements/ListElementV2/ListElementV2.vue'
import { useFocus, useHotkeysNavigation, shouldScroll, useTheme } from '@/composables'
import { getIdNext } from '@/utils'

export default defineComponent({
  name: 'TagApplierList',
  components: { Badge, ListElementV2, Keycap, RecycleScroller },
  props: {
    keyword: { type: String, required: true },
    items: { type: Array as PropType<BadgeType[]>, required: true },
    direction: { type: String as PropType<'asc' | 'desc'>, default: 'asc' },
    duplicate: { type: Boolean, default: false }
  },
  setup (props, { emit }: SetupContext) {
    const theme = useTheme()
    const recycleScroller = ref<any>()
    const focused: Ref<boolean> = ref(false)
    const selectedIdx = ref(0)
    const bufferThreshold: Ref<number> = ref(2)
    const recycleScrollerHeight: Ref<number> = ref(1)
    const firstVisibleIdx: Ref<number> = ref(0)
    const lastVisibleIdx: Ref<number> = ref(0)

    const itemHeight = computed((): number => {
      return 28 * theme.getCurrentScale()
    })

    const visibleItems = computed((): number => {
      return Math.round(recycleScrollerHeight.value / itemHeight.value)
    })

    const itemsLength = computed((): number => {
      return props.items ? props.items.length : 0
    })

    const buffer = computed((): number => {
      return Math.ceil(itemHeight.value * bufferThreshold.value)
    })

    /**
     * Check if keyword already exists as an annotation class
     */
    const parsedItems = computed((): BadgeType[] => {
      const sorted = sortBy(props.items, ({ label }) => label)
      return props.direction === 'asc' ? sorted : sorted.reverse()
    })

    /**
     * When the parsedItem get updated (eg; due to filtering)
     * reset the selectedIdx to avoid accessing a index of parsedItems
     * exceeding its length
     */
    watch(() => parsedItems.value, () => {
      setTimeout(() => (selectedIdx.value = 0), 0)
    })

    const scrollToItem = (index: number = 0): void => {
      if (recycleScroller.value && 'scrollToItem' in recycleScroller.value) {
        recycleScroller.value.scrollToItem(index)
      }
    }

    useFocus('tag-applier__list', (value: boolean) => {
      focused.value = value
    })

    useHotkeysNavigation({
      condition: focused,
      handlers: {
        increase: () => {
          const newIdx = getIdNext(selectedIdx.value, itemsLength.value, true)
          selectedIdx.value = newIdx
          const scrollToIdx = shouldScroll({
            idx: newIdx,
            next: true,
            length: itemsLength.value,
            firstIdx: firstVisibleIdx.value,
            lastIdx: lastVisibleIdx.value,
            visibleItems: visibleItems.value
          })
          if (scrollToIdx >= 0) { scrollToItem(scrollToIdx) }
        },
        decrease: () => {
          const newIdx = getIdNext(selectedIdx.value, itemsLength.value, false)
          selectedIdx.value = newIdx
          const scrollToIdx = shouldScroll({
            idx: newIdx,
            next: false,
            length: itemsLength.value,
            firstIdx: firstVisibleIdx.value,
            lastIdx: lastVisibleIdx.value,
            visibleItems: visibleItems.value
          })
          if (scrollToIdx >= 0) { scrollToItem(scrollToIdx) }
        },
        submit: () => {
          emit('create', parsedItems.value[selectedIdx.value]?.label)
          emit('close') // used in case tag-applier mini props it's on
        },
        close: () => {
          emit('close') // used in case tag-applier mini props it's on
        }
      },
      name: 'tag applier list',
      special: true
    })

    const onResize = (): void => {
      if (recycleScroller.value && recycleScroller.value.$el &&
        'offsetHeight' in recycleScroller.value.$el) {
        recycleScrollerHeight.value = recycleScroller.value.$el.offsetHeight
      }
    }

    const onUpdate = (startIdx: number, endIdx: number): void => {
      firstVisibleIdx.value = startIdx === 0
        ? startIdx
        : startIdx + bufferThreshold.value
      lastVisibleIdx.value = endIdx === itemsLength.value
        ? itemsLength.value
        : endIdx - bufferThreshold.value - 1
    }

    return {
      recycleScroller,
      focused,
      selectedIdx,
      recycleScrollerHeight,
      firstVisibleIdx,
      lastVisibleIdx,
      itemHeight,
      visibleItems,
      itemsLength,
      buffer,
      parsedItems,
      shouldScroll,
      scrollToItem,
      onResize,
      onUpdate
    }
  }
})
</script>

<style lang="scss" scoped>
.tag-applier__list {
  position: relative;
  display: flex;
  flex: 1 1 auto;
  height: auto;
  width: 100%;
  padding: 4px;
  border-top: 1px solid $colorBorderLight;
  @include scrollbarV2('vertical');

  &:focus,
  &:active {
    outline: none;
  }

  &__content {
    @include col;
    flex: 1;
    z-index: 2;
    height: 100%;
    max-width: 100%;
    @include scrollbarV2('vertical');
    overflow-x: hidden;

    :deep(.vue-recycle-scroller) {
      .vue-recycle-scroller__item-wrapper {

        .vue-recycle-scroller__item-view {

          &.hover {
            .list-element__content {
              background: $colorNeutralsLight100 !important;
            }
          }

          &.active {
            background: $colorNeutralsLight200;
          }

          .list-element {
            height: 28px;
            padding: 2px;

            &__content {
              .badge {
                @include row--wrap;
                align-items: center;
                width: 100%;

                &__content__label {
                  max-width: 100%;
                  @include ellipsis(1, md);
                }
              }
            }
          }
        }
      }
    }
  }

  &__no-content {
    @include row--center;
    flex: 1;
    min-height: 30px;
    max-width: 100%;
    @include typography(md, inter);
    padding: 16px;
    text-align: center;
    color: $colorContentSecondary;

    &__new-badge {
      max-width: 100%;
      @include ellipsis(2, md);
    }
  }
}
</style>
