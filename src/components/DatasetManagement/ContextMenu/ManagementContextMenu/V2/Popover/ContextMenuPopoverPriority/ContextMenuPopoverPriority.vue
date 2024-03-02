<template>
  <popover
    :show="show"
    placeholder="Custom Priority"
    @on-input="(val) => currentPriority = Number(val.replace(/[^0-9.]+/g, ''))"
    :input-value="`${currentPriority}`"
    large-number
  >
    <list-header
      size="medium"
      label="Set priority"
      disabled
    />
    <div class="popover-priority__content">
      <div class="priority__wrapper">
        <icon-toggle
          v-for="(n) in priorities"
          :key="n"
          class="priority__button"
          :active="currentPriority === n"
          @click="onClick(n)"
        >
          {{ n }}
        </icon-toggle>
      </div>
      <div class="priority-badge__wrapper">
        <badge
          label="Low"
          :color="{ r: 113, g: 122, b: 132, a: 1 }"
        />
        <badge
          label="High"
          :color="{ r: 113, g: 122, b: 132, a: 1 }"
        />
      </div>
    </div>
  </popover>
</template>

<script lang="ts">
import debounce from 'lodash/debounce'
import { defineComponent, onMounted, ref } from 'vue'

import { Badge } from '@/components/Common/Badge'
import ListHeader from '@/components/Common/Headers/ListHeader/ListHeader.vue'
import IconToggle from '@/components/Common/IconToggle/IconToggle.vue'
import Popover from '@/components/DatasetManagement/ContextMenu/ManagementContextMenu/V2/Popover/Popover.vue'
import { useToast } from '@/composables'

/**
 * @Component ContextMenuPopoverPriority
 * ~ Component will emit a number {priority} on click or input
 * @param {string} prop
 * */
export default defineComponent({
  name: 'ContextMenuPopoverPriority',
  components: {
    Badge,
    IconToggle,
    ListHeader,
    Popover
  },
  props: {
    show: {
      type: Boolean as () => boolean,
      default: false,
      required: false
    },
    priority: {
      type: Number as () => number,
      default: -1,
      required: false
    }
  },
  setup (props, { emit }) {
    const currentPriority = ref(0)
    const toast = useToast()

    const priorities = [0, 1, 2, 3, 4, 5]

    onMounted(() => {
      if (props.priority === -1) { return }
      currentPriority.value = props.priority
    })

    const emitChange = debounce(() => {
      const priority = currentPriority.value
      toast.info({ location: 'center', meta: { title: `Set priority to ${priority}` } })
      emit('set-priority', priority)
    }, 250)

    const onClick = (n: number): void => {
      currentPriority.value = n
      emitChange()
    }

    return {
      currentPriority,
      onClick,
      priorities
    }
  }
})
</script>

<style lang="scss" scoped>
.priority__wrapper {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-gap: 2px;
}

.popover-priority__content {
  display: block;
  padding: 0px 8px 8px 8px;
}

.priority-badge__wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;

  width: 100%;
  height: auto;

  margin-top: 4px;
}

.priority__button :deep(.icon-toggle__content) {
  padding: 4px;
}
</style>
