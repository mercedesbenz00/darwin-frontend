<template>
  <SortDropdown
    class="workflow__sort"
    :value="sortBy"
    :direction="sortDirection"
    :options="sortOptions"
    :disabled="disabled"
    @change="onSortChange($event, 'by')"
    @change-direction="onSortChange($event, 'direction')"
  />
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import SortDropdown from '@/components/Common/SortDropdown/V2/SortDropdown.vue'

interface Sort {
  text: string,
  icon: string,
  id: string
}

@Component({
  name: 'sort-control',
  components: { SortDropdown }
})
export default class SortControl extends Vue {
  @Prop({ default: 'inserted_at' })
  sortBy!: string

  @Prop({ default: 'asc' })
  sortDirection!: 'asc' | 'desc'

  @Prop({ default: false, type: Boolean })
  disabled!: boolean

  get sortOptions (): Sort[] {
    return [{
      text: 'Name',
      icon: '/static/imgs/sort/filename.svg',
      id: 'name'
    }, {
      text: 'Date created',
      icon: '/static/imgs/sort/date-created.svg',
      id: 'inserted_at'
    }, {
      text: 'Date modified',
      icon: '/static/imgs/sort/date-modified.svg',
      id: 'updated_at'
    }]
  }

  onSortChange (val: string, type: string): void {
    const { sortBy, sortDirection } = this

    if (type === 'by') {
      this.$emit('update:sort-by', val)
      this.$emit('change', { sortBy: val, sortDirection })
    } else if (type === 'direction') {
      this.$emit('update:sort-direction', val)
      this.$emit('change', { sortBy, sortDirection: val })
    }
  }
}
</script>
