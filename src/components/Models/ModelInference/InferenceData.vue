<template>
  <div class="inference">
    <div
      ref="canvasContainer"
      class="inference__view"
    >
      <layout-component
        v-if="editor.value"
        :editor="editor.value"
      />
    </div>
    <div class="inference__sidebar">
      <div class="inference__sidebar__section">
        <h4 class="inference__sidebar__section__header">
          Labels
        </h4>
        <div class="inference__labels">
          <div
            v-for="[label, { count, color }] in groupedAnnotations"
            :key="label"
            class="inference__label"
          >
            <div
              class="inference__label__text"
              :style="{background: color}"
            >
              {{ label }}
            </div>
            <div class="inference__label__count">
              {{ count }}
            </div>
          </div>
        </div>
      </div>
      <div class="inference__sidebar__section">
        <div class="inference__sidebar__section__header">
          <h4>Model output</h4>
          <copy-to-clipboard
            class="inference__sidebar__section__header__copy-button"
            :value="json"
          />
        </div>
        <pre
          class="inference__sidebar__section__content inference__json"
        >{{ JSON.stringify(inferenceResults, null, 2) }}</pre>
      </div>
      <div class="inference__sidebar__section">
        <positive-button
          v-if="mode === 'image'"
          class="inference__sidebar__button"
          @click="$emit('repick')"
        >
          Use another image
        </positive-button>
        <negative-button
          v-if="mode === 'video'"
          class="inference__sidebar__button"
          @click="$emit('stop-stream')"
        >
          Stop stream
        </negative-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Inject } from 'vue-property-decorator'

import CopyToClipboard from '@/components/Common/CopyToClipboard.vue'
import LayoutComponent from '@/components/WorkView/Layout'
import { Editor } from '@/engine/editor'
import { InferenceResult } from '@/engineCommon/backend'
import { TrainedModelPayload } from '@/store/types'
import { getRGBAColorHash, rgbaString } from '@/utils'

@Component({
  name: 'inference-data',
  components: {
    LayoutComponent,
    CopyToClipboard
  }
})
export default class InferenceData extends Vue {
  @Inject()
  editor!: { value: Editor | null }

  @Prop({ required: false, type: Array, default: () => [] })
  inferenceResults!: InferenceResult[]

  @Prop({ required: false, type: Array, default: () => [] })
  classes!: TrainedModelPayload['classes']

  @Prop({ required: true, type: String })
  imageData!: string

  @Prop({ required: true, type: String })
  mode!: 'image' | 'video'

  canvasSize: { width: number, height: number } | null = null

  $refs!: {
    canvasContainer: HTMLDivElement
    canvas: HTMLCanvasElement
  }

  mounted (): void {
    if (!this.editor.value) { return }
    this.editor.value.init(true)
    this.editor.value.activeView.showPills = false
    this.editor.value.disableEditSubAnnotations()
    const plugins = this.editor.value.pluginManager.pluginsForView()
    this.editor.value.installAllPlugins(plugins)
    // circumvent editor tool selection,
    // since this component doesn't need workview state management
    this.editor.value.toolManager.activateTool('select_tool')
    this.resizeCanvas()
    this.updateEditor()
    this.editor.value.activateCallbacks()

    window.addEventListener('resize', this.resizeCanvas)
    this.$once('hook:beforeDestroy', () => window.removeEventListener('resize', this.resizeCanvas))
  }

  resizeCanvas (): void {
    const { canvasContainer } = this.$refs
    this.editor.value?.layout.updateViewsCameraDimensions(
      canvasContainer.offsetWidth,
      canvasContainer.offsetHeight
    )
    this.editor.value?.scaleToFit()
  }

  @Watch('inferenceResults')
  onInferenceResults (): void { this.updateEditor() }

  updateEditor (): void {
    const { classes, editor, inferenceResults } = this
    if (!editor.value || !inferenceResults) { return }
    editor.value.activeView.overlayManager.reset()
    editor.value.activeView.measureManager.reset()
    editor.value.activeView.setInferenceData(inferenceResults, classes)
  }

  @Watch('imageData', { immediate: true })
  onImageData (imageData: string | null): void {
    if (!imageData) { return }
    this.$nextTick(() => {
      this.editor.value?.activeView.setRawImage(imageData)
    })
  }

  // TODO: Figure out how to get labels (classes)
  get groupedAnnotations () {
    const { classes } = this
    const initial: { [s: string]: { color: string, count: number} } = {}

    const grouping = this.inferenceResults.reduce((acc, annotation) => {
      const inferenceLabel = annotation.label || annotation.name
      if (!inferenceLabel) { return acc }
      const inferenceClass = classes.find(c => c.name === inferenceLabel)

      const displayName = inferenceClass
        ? inferenceClass.display_name || inferenceClass.name
        : inferenceLabel
      if (!displayName) { return acc }
      if (acc[displayName]) {
        acc[displayName].count += 1
      } else {
        const color = rgbaString(getRGBAColorHash(displayName))
        acc[displayName] = { count: 1, color }
      }
      return acc
    }, initial)

    return Object.entries(grouping)
  }

  get json (): string {
    return JSON.stringify(this.inferenceResults, null, 2)
  }
}
</script>

<style lang="scss" scoped>
.inference {
  @include row;
  width: 100%;

  .inference__view {
    flex: 5;
    overflow: hidden;
    position: relative;

    :deep(canvas) {
      @include noSelect;
      width: 100%;
      height: 100%;
    }
  }

  .inference__sidebar {
    flex: 2;
    margin-left: 25px;
    display: grid;
    height: 100%;
    grid-template-rows: 4fr 3fr auto;
    grid-row-gap: 25px;
  }

  .inference__sidebar__section {
    display: grid;
    grid-template-rows: auto 1fr;
    grid-auto-rows: 1fr;
    grid-row-gap: 15px;
    overflow: hidden;

    > :last-child {
      margin-bottom: -15px;
    }
  }

  .inference__labels {
    .inference__label {
      @include row--distributed;
      align-items: baseline;

      &:not(:last-child) {
        margin-bottom: 10px;
      }

      &__text,
      &__count {
        border-radius: 3px;
        @include typography(md-1, default);
        vertical-align: middle;
      }

      &__text {
        padding: 8px;
        color: $colorWhite;
      }

    }
  }

  .inference__sidebar__section__header {
    @include row--distributed;
    @include typography(xl, headlines, bold);
  }

  .inference__json {
    @include typography(md-2, source);
    line-height: 150%;
    background: $colorSecondaryLight3;
    color: $colorSecondaryLight;
    padding: 8px 0 8px 10px;
    white-space: pre-wrap;
    overflow: auto;
  }

  .inference__sidebar__button {
    width: 100%;
  }
}
</style>
