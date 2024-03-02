<template>
  <component
    :is="tag"
    class="export-format-pill"
  >
    {{ pill.name }}
  </component>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import FeatherLightPill from '@/components/Common/Pill/FeatherLightPill.vue'
import PinkPill from '@/components/Common/Pill/PinkPill.vue'
import YellowPill from '@/components/Common/Pill/YellowPill.vue'
import { ExportFormatPillType } from '@/components/DatasetManagement/ExportDialog/types'

@Component({
  name: 'export-format-pill',
  components: { FeatherLightPill, PinkPill, YellowPill }
})
export default class ExportFormatPill extends Vue {
  @Prop({ required: true })
  pill!: ExportFormatPillType

  get tag () {
    return `${this.pill.type}-pill`
  }
}
</script>

<style lang="scss" scoped>
.export-format-pill {
  padding: 2px 4px;
}
</style>
