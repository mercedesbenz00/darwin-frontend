<template>
  <div v-if="showMeasures">
    <measure-overlay
      v-for="(data, index) in annotations"
      :key="index"
      :data="data"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { View } from '@/engine/models'
import { MeasureOverlayData, RootState } from '@/store/types'

import MeasureOverlay from './MeasureOverlay.vue'

@Component({
  name: 'measure-overlays',
  components: { MeasureOverlay }
})
export default class MeasureOverlays extends Vue {
  @Prop({ required: true })
  view!: View

  @State((state: RootState) => state.workview.renderMeasures)
  renderMeasures!: boolean

  get annotations (): MeasureOverlayData[] {
    return Object.values(this.view.measureManager.measureOverlayDataEntries)
  }

  get showMeasures () {
    return this.renderMeasures && !!this.view.measureRegion
  }
}
</script>
