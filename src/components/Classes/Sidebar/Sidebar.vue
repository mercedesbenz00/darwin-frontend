<template>
  <sidebar
    :loading="loading"
    loading-label="Fetching Classes"
  >
    <primary-button
      class="classes-sidebar__create"
      size="medium"
      @click="$emit('create')"
    >
      + CREATE NEW CLASS
    </primary-button>
    <div class="classes-sidebar__control">
      <switch-gallery-layout
        :value="viewMode"
        @change="onViewModeChange"
      />
    </div>
    <div class="classes-sidebar__sort">
      <sort-dropdown
        :value="sortBy"
        :direction="sortDirection"
        :options="sortOptions"
        @change="onSortChange($event, 'by')"
        @change-direction="onSortChange($event, 'direction')"
      />
    </div>
    <div class="classes-sidebar__status">
      <annotation-type-filter
        :options="filterTypeOptions"
        :value="selectedTypeNames"
        show-all
        :all-count="statusAllCount"
        @change="setSelectedTypeNames"
      />
    </div>
  </sidebar>
</template>
<script lang="ts">
import { startCase } from 'lodash'
import { Component, Vue, Prop } from 'vue-property-decorator'
import { State } from 'vuex-class'

import AnnotationTypeFilter from '@/components/Classes/Sidebar/AnnotationTypeFilter.vue'
import SwitchGalleryLayout from '@/components/Common/Gallery/SwitchGalleryLayout.vue'
import { VIEW_MODE } from '@/components/Common/Gallery/types'
import SortDropdown from '@/components/Common/SortDropdown/V1/SortDropdown.vue'
import Sidebar from '@/components/DatasetManagement/Sidebar/Sidebar.vue'
import {
  AnnotationTypeName,
  AnnotationTypePayload,
  DatasetPayload,
  RootState
} from '@/store/types'

import { AnnotationTypeFilterItemType } from './types'

/**
 * A single item in the type count response payload, received from the backend
 */
type TypeCount = { id?: number, name: AnnotationTypeName | 'All', count: number }

/* eslint-disable camelcase */

/**
 * Response payload for the class detail request
 *
 * NOTE: Partially defined
 */
type ClassDetails = { type_counts: Array<TypeCount> }

/* eslint-enable camelcase */

@Component({
  name: 'classes-sidebar',
  components: { AnnotationTypeFilter, Sidebar, SortDropdown, SwitchGalleryLayout }
})
export default class ClassesSidebar extends Vue {
  @Prop({ required: false, type: Boolean, default: false })
  loading!: boolean

  @Prop({ required: false, type: Object as () => DatasetPayload | null, default: null })
  dataset!: DatasetPayload | null

  @State((state: RootState) => state.aclass.details)
  details!: ClassDetails

  @State((state: RootState) => state.aclass.types)
  annotationTypes!: AnnotationTypePayload[]

  get visibleTypeCounts (): TypeCount[] {
    if (!this.details || !this.details.type_counts) { return [] }

    return this.details.type_counts.filter(typeCount => {
      const type = this.annotationTypes.find(t => t.name === typeCount.name)
      return type?.visible
    })
  }

  get statusAllCount (): number | null {
    return this.details?.type_counts?.find(c => c.name === 'All')?.count || null
  }

  get filterTypeOptions (): AnnotationTypeFilterItemType[] {
    return this.visibleTypeCounts
      .filter<{ id: number, name: AnnotationTypeName, count: number}>(
        (st): st is { id: number, name: AnnotationTypeName, count: number } =>
          st.name !== 'All' && !!st.id
      )
      .map(({ id, count, name }) => ({
        id: id!,
        label: startCase(name),
        name,
        color: this.$theme.getColor('colorPrimaryLight'),
        count
      }))
  }

  @State((state: RootState) => state.aclass.classesTabSelectedTypeNames)
  selectedTypeNames!: number[]

  setSelectedTypeNames (names: AnnotationTypeName[]) {
    this.$store.commit('aclass/SET_CLASSES_TAB_SELECTED_TYPE_NAMES', names)
  }

  @State(state => state.aclass.classesTabViewMode)
  viewMode!: VIEW_MODE

  onViewModeChange (viewMode: number) {
    this.$store.commit('aclass/SET_CLASSES_TAB_VIEW_MODE', viewMode)
  }

  @State(state => state.aclass.classesTabSortBy)
  sortBy!: string

  @State(state => state.aclass.classesTabSortDirection)
  sortDirection!: 'asc' | 'desc'

  get sortOptions () {
    return [{
      text: 'Name',
      icon: '/static/imgs/sort/filename.svg',
      id: 'name'
    }, {
      text: 'Date added',
      icon: '/static/imgs/sort/date-created.svg',
      id: 'id'
    }]
  }

  onSortChange (val: string, type: string) {
    this.$store.commit('aclass/SET_CLASSES_TAB_SORT_OPTION', {
      by: this.sortBy,
      direction: this.sortDirection,
      [type]: val
    })
  }
}
</script>

<style lang="scss" scoped>

.classes-sidebar__create {
  width: 100%;
  margin-bottom: 18px;
}

.classes-sidebar__control {
  margin-bottom: 18px;
}

.classes-sidebar__sort {
  margin-bottom: 12px;
}

.classes-sidebar__status {
  margin-bottom: 10px;
}
</style>
