<template>
  <div
    v-if="offset > 0"
    class="video-annotations-item-keyframe"
    :style="style"
    @mouseenter="isSelected = true"
    @mouseleave="isSelected = false"
    @click.stop="$emit('select')"
    @dblclick.stop
    @contextmenu.prevent="$emit('delete')"
  >
    <sub-keyframe-icon
      v-if="isSubkey"
      class="video-annotations-item-subkeyframe__icon"
      :class="{ 'video-annotations-item-keyframe__icon--selected': isSelected }"
      :style="subIconStyle"
    />
    <keyframe-icon
      v-else
      class="video-annotations-item-keyframe__icon"
      :class="{ 'video-annotations-item-keyframe__icon--selected': isSelected }"
      :style="mainIconStyle"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { Annotation } from '@/engine/models'

import KeyframeIcon from './assets/keyframe.svg?inline'
import SubKeyframeIcon from './assets/subkeyframe.svg?inline'

@Component({
  name: 'video-annotations-item-keyframe',
  components: { KeyframeIcon, SubKeyframeIcon }
})
export default class VideoAnnotationsItemKeyframe extends Vue {
  @Prop({ required: true })
  annotation!: Annotation

  @Prop({ required: true })
  keyframeIndex!: number

  @Prop({ required: true })
  position!: number

  @Prop({ type: Boolean, default: false })
  isSubkey!: boolean

  @State(state => state.ui.workviewVideoFrameLineWidth)
  frameLineWidth!: number

  isSelected: boolean = false

  get offset () {
    const startIndex = this.annotation.data.segments[0][0]
    return this.keyframeIndex - startIndex
  }

  get style () {
    const { frameLineWidth } = this
    const left = this.offset * frameLineWidth - 1
    return {
      left: `${left}px`,
      top: `${this.position === 0 ? '50%' : (this.position > 0 ? '32%' : '75%')}`,
      width: `${frameLineWidth - 1}px`
    }
  }

  get subIconStyle () {
    const subIconSize = this.frameLineWidth <= 6 ? 5 : 7
    const sizePx = `${subIconSize}px`
    return {
      width: sizePx,
      minWidth: sizePx,
      height: sizePx,
      minHeight: sizePx
    }
  }

  get mainIconStyle () {
    const mainIconSize = this.frameLineWidth <= 6 ? 5 : 7
    const sizePx = `${mainIconSize}px`
    return {
      width: sizePx,
      minWidth: sizePx,
      height: sizePx,
      minHeight: sizePx
    }
  }
}
</script>

<style lang="scss" scoped>
.video-annotations-item-keyframe {
  @include col--center;
  position: absolute;
  cursor: default;
  transform: translateY(-50%);
}

.video-annotations-item-keyframe__icon,
.video-annotations-item-subkeyframe__icon {
  color: $color90Black;
}

.video-annotations-item-keyframe__icon--selected {
  color: $colorPink;
}
</style>
