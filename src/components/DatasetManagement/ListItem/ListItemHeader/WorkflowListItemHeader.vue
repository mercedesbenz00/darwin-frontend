<template>
  <div class="list-item-header">
    <list-item-header-item
      v-for="({ id, title, sortable }) of columns"
      :id="id"
      :key="id"
      :class="`list-item-header__${id}`"
      :title="title"
      :sortable="sortable"
      :active="id === activeSortBy"
      :sort-direction="sortable && (id === activeSortBy ? activeSortDirection : 'asc')"
      @click="onColumnClick"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Getter } from 'vuex-class'

import { DatasetPayload } from '@/store/types'

import ListItemHeaderItem from './ListItemHeaderItem.vue'

@Component({
  name: 'list-item-header',
  components: { ListItemHeaderItem }
})
export default class ListItemHeader extends Vue {
  @Prop({ required: true })
  dataset!: DatasetPayload

  @Getter('dataTabSortBy', { namespace: 'dataset' })
  getActiveSortBy!: (dataset: DatasetPayload) => string

  @Getter('dataTabSortDirection', { namespace: 'dataset' })
  getActiveSortDirection!: (dataset: DatasetPayload) => 'asc' | 'desc'

  get activeSortBy (): string {
    return this.getActiveSortBy(this.dataset)
  }

  get activeSortDirection (): 'asc' | 'desc' {
    return this.getActiveSortDirection(this.dataset)
  }

  get columns () {
    return [
      { id: 'checkbox' },
      { id: 'thumbnail' },
      { id: 'file_name', title: 'Image Name' },
      { id: 'status', title: 'Status' },
      { id: 'inserted_at', title: 'Date Added', sortable: true },
      { id: 'modified_at', title: 'Date Modified', sortable: true },
      { id: 'labels', title: 'Tags' },
      { id: 'image_dimension', title: 'Pixels', sortable: true },
      { id: 'file_size', title: 'Size', sortable: true }
    ]
  }

  onColumnClick (params: { id: string, sortDirection: number }) {
    const { id, sortDirection } = params
    // Update the sort query in the url
    this.$router.push({
      query: {
        ...this.$route.query,
        sort: `${id}:${sortDirection}`
      }
    })
  }
}
</script>

<style lang="scss" scoped>
@import "workflow-list-item";

.list-item-header {
  @include workflow-list-item;
  padding-right: 10px;
  box-shadow: 0 3px 10px -5px rgba(145, 169, 192, .3);
  border-radius: 3px;
  margin-bottom: 0;
}

.list-item-header__file_name {
  display: block;
}
</style>
