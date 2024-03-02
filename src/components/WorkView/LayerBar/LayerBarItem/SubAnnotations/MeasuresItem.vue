<template>
  <div
    v-if="showMeasures && measureData"
    class="measures-item"
  >
    {{ measureData.label }}
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { Editor } from '@/engine/editor'
import { StageAnnotation } from '@/store/modules/workview/types'
import { RootState } from '@/store/types'

@Component({
  name: 'measures-item'
})
export default class MeasuresItem extends Vue {
  @Prop({ required: true })
  annotation!: StageAnnotation

  @Prop({ required: true })
  editor!: Editor

  @Prop({ required: false, default: false, type: Boolean })
  readonly!: boolean

  @State((state: RootState) => state.workview.renderMeasures)
  renderMeasures!: boolean

  get showMeasures () {
    return this.renderMeasures && !!this.editor.measureRegion
  }

  get measureData () {
    return this.editor.activeView.measureManager.measureOverlayDataEntries[this.annotation.id]
  }
}
</script>

<style lang="scss" scoped>
.measures-item {
  @include typography(sm);
  color: $colorAliceNight;
  margin-left: 2px;
}
</style>
