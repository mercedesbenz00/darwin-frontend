<template>
  <div
    v-if="hotkey"
    class="class-card-hotkey-display"
  >
    <div class="class-card-hotkey-display__inner">
      {{ hotkey }}
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { AnnotationClassPayload, DatasetPayload } from '@/store/types'
import { getAnnotationClassHotkey } from '@/utils'

@Component({
  name: 'class-card-hotkey-display'
})
export default class ClassCardHotkeyDisplay extends Vue {
  @Prop({ required: true, type: Object as () => AnnotationClassPayload })
  annotationClass!: AnnotationClassPayload

  @Prop({ required: false, type: Object as () => DatasetPayload, default: null })
  dataset!: DatasetPayload | null

  get hotkey (): string | null {
    const { annotationClass, dataset } = this
    if (!dataset) { return null }

    return getAnnotationClassHotkey(dataset.annotation_hotkeys, annotationClass.id)
  }
}
</script>

<style lang="scss" scoped>
.class-card-hotkey-display {
  width: 15px;
  height: 100%;
  background: $colorAliceShadow;
  border-radius: 3px;
}

.class-card-hotkey-display__inner {
  width: 100%;
  height: calc(100% - 1px);
  @include row--center;
  background: $colorAliceBlue;
  border: 1px solid $colorAliceShade;
  border-radius: 3px;

  @include typography(sm, inter, bold);
  text-align: center;
  color: #607C95;
}
</style>
