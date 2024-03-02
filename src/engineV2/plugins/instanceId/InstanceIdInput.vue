<template>
  <div
    v-click-outside="onBlur"
    class="instance-id-input"
  >
    <input
      ref="input"
      v-model="value"
      placeholder="Instance ID"
      type="text"
      @keydown.stop
      @keypress.stop="onlyNumber"
      @keyup.stop
      @keydown.enter.stop="save"
    ><br>
    <span class="instance-id-input__tip">Numerical ID. Press enter to save</span>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import { addOrUpdateSubAnnotation, removeSubAnnotationAction } from '@/engineV2/actions'
import { Editor } from '@/engineV2/editor'
import { Annotation } from '@/engineV2/models'

@Component({
  name: 'instance-id-input'
})
export default class InstanceIDInput extends Vue {
  public value: string = ''
  public masterAnnotation: Annotation | null = null
  private editor!: Editor

  $refs!: Vue['$refs'] & {
    input: HTMLInputElement
  }

  mounted (): void {
    setTimeout(() => {
      if (!this.$refs.input) { return }
      this.$refs.input.focus()
    }, 200)
  }

  onBlur (): void {
    this.value = ''
    // cannot deactivate the tool right away, or we would end up in a bad state
    // when the deactivation code has finished.
    setTimeout(() => this.editor.toolManager.deactivateTool('instance_id_tool'), 100)
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

  async save (): Promise<void> {
    if (!this.masterAnnotation) { return }

    if (this.value === '') {
      await this.editor.actionManager.do(
        removeSubAnnotationAction(this.editor.activeView, 'instance_id', this.masterAnnotation)
      )
    } else {
      const annotation = this.editor.activeView.annotationManager.initializeSubAnnotation(
        'instance_id',
        this.masterAnnotation,
        { value: parseInt(this.value) }
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
.instance-id-input {
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

.instance-id-input__tip {
   margin: 5px 10px;
   @include typography(sm, default, bold);
   color: $colorSecondaryLight;
}
</style>
