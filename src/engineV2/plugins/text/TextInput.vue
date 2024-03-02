<template>
  <div
    v-click-outside="onBlur"
    class="text-input"
  >
    <input
      ref="input"
      v-model="text"
      placeholder="Add text"
      type="text"
      @keydown.stop
      @keypress.stop
      @keyup.stop
      @keydown.enter.stop="save"
    ><br>
    <span class="text-input__tip"> Press enter to save </span>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import { addOrUpdateSubAnnotation, removeSubAnnotationAction } from '@/engineV2/actions'
import { Editor } from '@/engineV2/editor'
import { Annotation } from '@/engineV2/models'

@Component({ name: 'text-input' })
export default class TextInput extends Vue {
  public text: string = ''
  public masterAnnotation: Annotation | null = null
  private editor!: Editor

  $refs!: Vue['$refs'] & {
    input: HTMLInputElement
  }

  mounted () {
    setTimeout(() => {
      if (!this.$refs.input) { return }
      this.$refs.input.focus()
    }, 200)
  }

  onBlur () {
    this.text = ''
    // cannot deactivate the tool right away, or we would end up in a bad state
    // when the deactivation code has finished.
    setTimeout(() => this.editor.toolManager.deactivateTool('text_tool'), 100)
  }

  async save () {
    if (!this.masterAnnotation) { return }

    if (this.text === '') {
      await this.editor.actionManager.do(
        removeSubAnnotationAction(this.editor.activeView, 'text', this.masterAnnotation)
      )
    } else {
      const annotation =
        this.editor.activeView.annotationManager.initializeSubAnnotation(
          'text',
          this.masterAnnotation,
          { text: this.text }
        )
      if (!annotation) { return }

      await this.editor.actionManager.do(
        addOrUpdateSubAnnotation(this.editor.activeView, annotation, this.masterAnnotation)
      )
    }

    this.$emit('saved')
  }
}
</script>

<style lang="scss" scoped>
.text-input {
  background: $colorWhite;
  border-radius: $border-radius-default;
  overflow: hidden;

  input {
    border-radius: $border-radius-default;
    @include typography(md, default);
    background: $colorLineGrey !important;
    color: $colorSecondaryDark;

    width: 100%;
    padding: 0 6px 0 6px;
    max-height: 200px;
    overflow: auto;

    &::-webkit-input-placeholder {
      color: $colorSecondaryLight;
    }
    &::-moz-placeholder {
      color: $colorSecondaryLight;
    }
    &:-moz-placeholder {
      color: $colorSecondaryLight;
    }
    &:-ms-input-placeholder {
      color: $colorSecondaryLight;
    }
  }

}

.text-input__tip {
   margin: 5px 10px;
   @include typography(sm, default, bold);
   color: $colorSecondaryLight;
}
</style>
