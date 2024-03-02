<template>
  <sub-annotation-item
    v-if="editorAnnotation"
    class="text-item"
    :annotation-class="annotationClass"
    :readonly="readonly"
    type="text"
  >
    <content-editable
      ref="input"
      v-model="value"
      v-input-auto-blur="true"
      class="text-item__input"
      :disabled="readonly"
      disable-multiline
      placeholder="Click to add text"
      type="text"
      @blur.native="onBlur"
      @dblclick.native.stop
      @keydown.native.stop
      @keypress.native.stop
      @keyup.native.stop
      @enter="onEnter"
    />
  </sub-annotation-item>
</template>

<script lang="ts">
import { Component, Prop, Ref, Vue, Watch } from 'vue-property-decorator'

import ContentEditable from '@/components/Common/ContentEditable.vue'
import { addOrUpdateSubAnnotation, removeSubAnnotationAction } from '@/engine/actions'
import { Editor } from '@/engine/editor'
import { Text } from '@/engine/plugins/text/types'
import { StageAnnotation } from '@/store/modules/workview/types'
import { Annotation, AnnotationClassPayload } from '@/store/types'

import SubAnnotationItem from './SubAnnotationItem.vue'

@Component({
  name: 'text-item',
  components: { ContentEditable, SubAnnotationItem }
})
export default class TextItem extends Vue {
  @Prop({ required: true })
  annotation!: StageAnnotation

  @Prop({ required: true })
  annotationClass!: AnnotationClassPayload

  @Prop({ required: true })
  editor!: Editor

  @Prop({ required: false, default: null })
  data!: Text | null

  @Prop({ required: false, default: false, type: Boolean })
  readonly!: boolean

  @Ref('input')
  readonly inputRef?: ContentEditable

  value: string = ''

  get editorAnnotation (): Annotation | undefined {
    return this.editor.activeView.annotations.find(a => a.id === this.annotation.id)
  }

  blur () {
    if (!this.inputRef) { return }
    this.inputRef.blur()
  }

  @Watch('data', { immediate: true })
  onData () {
    this.value = (this.data && this.data.text) || ''
  }

  onBlur () {
    this.value = (this.data && this.data.text) || ''
  }

  async onEnter () {
    await this.save()
    this.blur()
  }

  async save () {
    const { editor, editorAnnotation } = this
    if (!editorAnnotation) { return }

    if (this.value === '') {
      await editor.actionManager.do(
        removeSubAnnotationAction(editor, 'text', editorAnnotation)
      )
    } else {
      const annotation =
        editor.initializeSubAnnotation('text', editorAnnotation, { text: this.value })
      if (!annotation) { return }

      await editor.actionManager.do(
        addOrUpdateSubAnnotation(editor, annotation, editorAnnotation)
      )
    }
  }
}
</script>

<style lang="scss" scoped>
.text-item {
  overflow: hidden;
}

.text-item__input {
  flex: 1;
  padding: 2px 3px;
  max-height: 200px;
  overflow-x: auto;

  border-radius: $border-radius-default;
  @include typography(sm, default);
  color: $colorBlack;

  &:empty:before {
    color: $colorAliceNight;
  }

  &:hover, &:focus {
    padding: 2px 3px;
    border-radius: $border-radius-default;
  }

  &:focus {
    border: none;
    background: $colorAliceBlue;
    box-shadow: inset 0px 2px 4px rgba(145, 169, 192, 0.3);
  }
}
</style>
