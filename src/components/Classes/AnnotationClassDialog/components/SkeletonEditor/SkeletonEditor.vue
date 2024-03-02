<template>
  <annotation-class-section
    ref="container"
    title="Skeleton Editor"
    :error="error"
  >
    <template #label>
      <info title="Skeleton Editor">
        Click to enter the starting position of skeleton points.
        <br>You won’t be able to add or remove points after creating the class.
        <br>You can link nodes, rename, and move them.
      </info>
    </template>
    <div class="skeleton-workview">
      <canvas
        id="skeletonCanvas"
        ref="skeletonCanvas"
        class="skeleton-workview__canvas"
      />
      <skeleton-node
        v-for="(node, index) of engine.nodes"
        :key="`node${index}`"
        :engine="engine"
        :node="node"
        @change="onChange"
      />
      <div
        v-if="showTips"
        class="skeleton-workview__tips"
      >
        Click to enter the starting position of skeleton points.
        <br>You won’t be able to add or remove points after creating the class.
      </div>
    </div>
  </annotation-class-section>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

import AnnotationClassSection from '@/components/Classes/AnnotationClassDialog/components/Common/AnnotationClassSection.vue'
import Info from '@/components/Common/Info.vue'
import { SkeletonMetadata } from '@/store/types'

import SkeletonNode from './SkeletonNode.vue'
import SkeletonEditorEngine from './engine/SkeletonEditorEngine'

@Component({
  name: 'skeleton-editor',
  components: { AnnotationClassSection, Info, SkeletonNode }
})
export default class SkeletonEditor extends Vue {
  @Prop({ required: true })
  editing!: boolean

  @Prop({ required: true })
  skeleton!: SkeletonMetadata

  @Prop({ required: true })
  strokeColor!: string

  @Prop()
  error?: string

  engine: SkeletonEditorEngine = new SkeletonEditorEngine((data: SkeletonMetadata) => {
    this.$emit('change', data)
  })

  showTips: boolean = true

  $refs!: {
    container: AnnotationClassSection
    skeletonCanvas: HTMLCanvasElement
  }

  onChange (): void {
    this.$emit('change', this.engine.getRawData())
  }

  @Watch('editing', { immediate: true })
  onEditingChange (): void {
    this.engine.setEditing(this.editing)
  }

  @Watch('strokeColor', { immediate: true })
  onStrokeColorChange (): void {
    this.engine.setStrokeColor(this.strokeColor)
  }

  @Watch('engine.edges')
  onEdgesChange (): void {
    if (this.engine.isEmpty) { return }
    this.showTips = false
  }

  @Watch('engine.nodes')
  onNodesChange (): void {
    if (this.engine.isEmpty) { return }
    this.showTips = false
  }

  @Watch('skeleton', { immediate: true })
  onSkeletonChange (): void {
    this.engine.setRawData(this.skeleton)
  }

  mounted (): void {
    this.engine.setScale(this.$theme.getCurrentScale())
    this.engine.setMainCanvas(this.$refs.skeletonCanvas)

    if (this.editing) {
      this.showTips = false
    }
  }

  beforeDestroy (): void {
    this.engine.reset()
  }

  public scrollTo (): void {
    this.$refs.container.scrollTo()
  }
}
</script>

<style lang="scss" scoped>
.skeleton-workview {
  @include row--center;
  position: relative;
  width: 100%;
  height: 300px;
}

.skeleton-workview__canvas {
  width: 100%;
  height: 100%;
  background: $colorAliceShade;
  border-radius: 3px;
  overflow: hidden;
  cursor: url(./assets/cursor_add.svg) 10 7, crosshair;
}

.skeleton-workview__tips {
  position: absolute;
  bottom: 20px;
  @include typography(md);
  color: $color90Black;
}
</style>
