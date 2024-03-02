<template>
  <sub-annotation-item
    v-if="editorAnnotation"
    class="instance-id-item"
    :annotation-class="annotationClass"
    :readonly="readonly"
    type="instance_id"
  >
    <content-editable
      ref="input"
      v-model="value"
      v-input-auto-blur="true"
      class="instance-id-item__input"
      disable-multiline
      :disabled="readonly"
      placeholder="Click to add instance id"
      type="text"
      @blur.native="onBlur"
      @dblclick.native.stop
      @keydown.native.stop
      @keypress.native.stop="onlyNumber"
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
import { InstanceID } from '@/engine/plugins/instanceId/types'
import { StageAnnotation } from '@/store/modules/workview/types'
import { Annotation, AnnotationClassPayload } from '@/store/types'

import SubAnnotationItem from './SubAnnotationItem.vue'

@Component({
  name: 'instance-id-item',
  components: { ContentEditable, SubAnnotationItem }
})
export default class InstanceIdItem extends Vue {
  @Prop({ required: true })
  annotation!: StageAnnotation

  @Prop({ required: true })
  annotationClass!: AnnotationClassPayload

  @Prop({ required: true })
  editor!: Editor

  @Prop({ required: false, default: null })
  data!: Partial<InstanceID> | null

  @Prop({ required: false, default: false, type: Boolean })
  readonly!: boolean

  @Ref('input')
  readonly inputRef?: ContentEditable

  value: string = ''

  get editorAnnotation (): Annotation | undefined {
    return this.editor.activeView.annotations.find(a => a.id === this.annotation.id)
  }

  blur (): void {
    if (!this.inputRef) { return }
    this.inputRef.blur()
  }

  @Watch('data', { immediate: true })
  onData (): void {
    this.value = (this.data && this.data.value) ? this.data.value.toString() : ''
  }

  onBlur (): void {
    this.value = (this.data && this.data.value) ? this.data.value.toString() : ''
  }

  onlyNumber (event: KeyboardEvent): void {
    const keyCode = (event.keyCode ? event.keyCode : event.which)
    if ((keyCode < 48 || keyCode > 57) && keyCode !== 46 && keyCode !== 13 && keyCode !== 8) {
      this.$store.dispatch('toast/notify', {
        content: 'The instance ID is a numeric value. Please only use numbers'
      })
      event.preventDefault()
    }
  }

  async onEnter (): Promise<void> {
    await this.save()
    this.blur()
  }

  async save (): Promise<void> {
    const { editor, editorAnnotation } = this
    if (!editorAnnotation) { return }

    // If it's trying to save the same value, no need to save again.
    if (this.data && this.data.value && this.value === this.data.value.toString()) { return }

    if (this.value === '') {
      await this.editor.actionManager.do(
        removeSubAnnotationAction(this.editor, 'instance_id', editorAnnotation)
      )
    } else {
      const annotation = editor.initializeSubAnnotation(
        'instance_id',
        editorAnnotation,
        { value: parseInt(this.value) }
      )

      if (!annotation) { return }
      await editor.actionManager.do(
        addOrUpdateSubAnnotation(this.editor, annotation, editorAnnotation)
      )
    }
  }
}
</script>

<style lang="scss" scoped>
.instance-id-item {
  overflow: hidden;
}

.instance-id-item__input {
  width: 100%;
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
