<template>
  <SortDropdown
    :value="sortBy"
    :direction="sortDirection"
    :options="sortOptions"
    @change="onSortChange($event, 'by')"
    @change-direction="onSortChange($event, 'direction')"
  />
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  PropType,
  SetupContext
} from 'vue'

import SortDropdown from '@/components/Common/SortDropdown/V2/SortDropdown.vue'

export default defineComponent({
  name: 'V2SortControl',
  components: { SortDropdown },
  props: {
    sortBy: {
      required: true,
      type: String
    },
    sortDirection: {
      required: true,
      type: String as PropType<'asc' | 'desc'>
    }
  },
  setup (props, context: SetupContext) {
    const sortOptions = computed(() => {
      return [{
        text: 'Date added',
        icon: '/static/imgs/sort/date-created.svg',
        id: 'id'
      }, {
        text: 'Date modified',
        icon: '/static/imgs/sort/date-modified.svg',
        id: 'updated_at'
      }, {
        text: 'Image file size',
        icon: '/static/imgs/sort/progress.svg',
        id: 'byte_size'
      }, {
        text: 'Name',
        icon: '/static/imgs/sort/filename.svg',
        id: 'name'
      }, {
        text: 'Priority',
        icon: '/static/imgs/sort/priority.svg',
        id: 'priority'
      }]
    })

    const onSortChange = (val: string, type: string) => {

      if (type === 'by') {
        context.emit('update:sort-by', val)
        context.emit('change', { sortBy: val, sortDirection: props.sortDirection })
      } else if (type === 'direction') {
        context.emit('update:sort-direction', val)
        context.emit('change', { sortBy: props.sortBy, sortDirection: val })
      }
    }

    return {
      sortOptions,
      onSortChange
    }
  }
})
</script>
