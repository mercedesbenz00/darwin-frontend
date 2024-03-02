<template>
  <div
    ref="badges"
    class="badges"
    :class="{
      'badges--wrap': wrap,
    }"
  >
    <badge
      v-for="{ label, color, highContrast } in limitedItems"
      :key="label"
      :color="color"
      :label="label"
      :high-contrast="highContrast || selected"
      @delete="$emit('delete:item', label)"
      @click="$emit('click:item', label)"
    />
    <badge
      v-if="showMore"
      key="more"
      class="more-badge"
      label="..."
      :override-tooltip="otherTooltip"
      :high-contrast="selected"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, Ref, onMounted } from 'vue'

import { Badge, BadgeType, BadgesProps } from './'
/*
 * Sometimes that UI component is also
 * referred as chip or pill other than badge
 */
export default defineComponent({
  name: 'Badges',
  components: { Badge },
  props: {
    items: {
      type: Array as PropType<BadgeType[]>,
      required: true
    },
    selected: {
      type: Boolean,
      default: false
    },
    wrap: {
      type: Boolean,
      default: false
    }
  },
  setup (props: BadgesProps) {
    const badges = ref<HTMLDivElement>()

    const width: Ref<number> = ref(0)
    const threshold: Ref<number> = ref(1)

    const itemsLength = computed((): number => {
      return (props.items || []).length
    })

    const limitedItems = computed((): BadgeType[] => {
      if (!props.wrap && itemsLength.value > 0) {
        return props.items
          .slice()
          .splice(0, threshold.value)
          // both slice and splice avoid mutating the item prop
      }
      return props.items
    })

    const limitedItemsLength = computed((): number => {
      return (limitedItems.value || []).length
    })

    const otherItems = computed((): BadgeType[] => {
      if (itemsLength.value > 0) {
        return props.items
          .slice()
          .splice(threshold.value, itemsLength.value - 1)
          // both slice and splice avoid mutating the item prop
      }
      return []
    })

    const showMore = computed((): boolean => {
      return itemsLength.value > limitedItemsLength.value
    })

    const otherTooltip = computed((): string => {
      if (showMore.value) {
        return otherItems.value
          .map(({ label }) => label)
          .join(', ')
      }
      return ''
    })

    // calculate how many badges could be
    // horizontally placed in their wrapper
    // without exceeding its width
    const updateThreshold = (): void => {
      width.value = badges.value?.offsetWidth || 0
      if (props.items && itemsLength.value > 0) {
        props.items
          .reduce((acc: number, { label }) => {
            const _width = (label || '').length * 8 + 8
            if (width.value - _width - 2 - acc >= 0) {
              acc = (acc + _width) || 0
              threshold.value += 1
            }
            return acc
          }, 0)
      }
    }

    onMounted(() => {
      updateThreshold()
    })

    return {
      badges,
      width,
      threshold,
      itemsLength,
      limitedItems,
      limitedItemsLength,
      otherItems,
      showMore,
      otherTooltip,
      updateThreshold
    }
  }
})
</script>

<style lang="scss" scoped>
.badges {
  @include row;
  align-items: center;
  width: 100%;
  gap: 2px;

  &--wrap {
    @include row--wrap;
  }
}
</style>
