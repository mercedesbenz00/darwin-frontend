<template>
  <div class="data-sidebar__switch-layout">
    <slider
      :value="sliderValue"
      :options="sliderOptions"
      @change="onColumnCountChange"
    />
    <switch-gallery-layout
      class="data-sidebar__layout"
      :value="viewMode"
      @change="onViewModeChange"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import SwitchGalleryLayout from '@/components/Common/Gallery/SwitchGalleryLayout.vue'
import { VIEW_MODE } from '@/components/Common/Gallery/types'
import Slider from '@/components/Common/Slider/V1/Slider.vue'

@Component({
  name: 'gallery-control',
  components: {
    Slider,
    SwitchGalleryLayout
  }
})
export default class GalleryControl extends Vue {
  @State(state => state.dataset.dataTabColumnCount)
  columnCount!: number

  @State(state => state.dataset.dataTabViewMode)
  viewMode!: VIEW_MODE

  maxColumns: number | null = null

  get sliderValue () {
    return this.maxColumns ? this.maxColumns - this.columnCount + 1 : 1
  }

  get sliderOptions () {
    return {
      disabled: this.viewMode === VIEW_MODE.LIST,
      height: 2,
      dotSize: 10,
      min: 1,
      max: this.maxColumns || 10,
      speed: 1,
      tooltip: 'none',
      dotOptions: {
        disabled: this.viewMode === VIEW_MODE.LIST
      },
      dotStyle: { background: '#0B2448' }
    }
  }

  mounted (): void {
    this.updateMaxColumns()
    window.addEventListener('resize', this.updateMaxColumns)
    this.$once('hook:beforeDestroy', () =>
      window.removeEventListener('resize', this.updateMaxColumns)
    )
  }

  updateMaxColumns () {
    const breakpoint = this.$theme.getCurrentBreakpoint()

    const mapMaxColumns: { [key: string]: number } =
      { lg: 5, xl: 6, xxl: 7, xxxl: 8, xivl: 9, xvl: 12 }

    this.maxColumns = mapMaxColumns[breakpoint]
    if (this.columnCount > this.maxColumns) {
      this.$store.commit('dataset/SET_DATA_TAB_COLUMN_COUNT', this.maxColumns)
    }
  }

  onColumnCountChange (columnCount: number) {
    this.$store.commit(
      'dataset/SET_DATA_TAB_COLUMN_COUNT',
      this.maxColumns ? this.maxColumns - columnCount + 1 : 1
    )
  }

  onViewModeChange (viewMode: number) {
    this.$store.commit('dataset/SET_DATA_TAB_VIEW_MODE', viewMode)
  }
}
</script>

<style lang="scss" scoped>
.data-sidebar__switch-layout {
  @include row--distributed--center;
  padding-left: 5px;
}

.data-sidebar__layout {
  margin-left: 15px;
}
</style>
