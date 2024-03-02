<template>
  <SortDropdown
    :value="sortBy"
    :direction="sortDirection"
    :options="sortOptions"
    :emit-on-navigation="false"
    @change="onSortChange($event, 'by')"
    @change-direction="onSortChange($event, 'direction')"
  />
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import SortDropdown from '@/components/Common/SortDropdown/V2/SortDropdown.vue'
import { DropdownOption } from '@/components/Common/SortDropdown/types'

@Component({
  name: 'sort-control',
  components: { SortDropdown }
})
export default class SortControl extends Vue {
  @Prop({ required: true })
  sortBy!: string

  @Prop({ required: true })
  sortDirection!: 'asc' | 'desc'

  get sortOptions (): DropdownOption[] {
    return [{
      text: 'Date added',
      icon: '/static/imgs/sort/date-created.svg',
      id: 'inserted_at'
    }, {
      text: 'Date modified',
      icon: '/static/imgs/sort/date-modified.svg',
      id: 'modified_at'
    }, {
      text: 'Image dimensions',
      icon: '/static/imgs/sort/images.svg',
      id: 'image_dimension'
    }, {
      text: 'Image file size',
      icon: '/static/imgs/sort/progress.svg',
      id: 'file_size'
    }, {
      text: 'Filename',
      icon: '/static/imgs/sort/filename.svg',
      id: 'filename'
    }, {
      text: 'Priority',
      icon: '/static/imgs/sort/priority.svg',
      id: 'priority'
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
