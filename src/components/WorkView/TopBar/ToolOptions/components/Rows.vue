<template>
  <input
    v-model="_value"
    v-input-auto-blur="true"
    class="rows"
    @keydown.stop
    @keypress.stop="onlyNumber"
    @keyup.stop
  >
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { Editor } from '@/engine/editor'

@Component({ name: 'rows' })
export default class Rows extends Vue {
  @Prop({ required: true })
  editor!: Editor

  @Prop({ required: true, type: Number })
  value!: number

  get _value (): string { return this.value.toString() }
  set _value (value: string) {
    const size = parseInt(value, 10)
    if (size <= 0 || isNaN(size)) {
      this.$store.dispatch('toast/notify', {
        content: 'Number of rows should be a number greater than 0'
      })
      return
    }
    this.editor.callCommand('table_tool.set_rows', size)
  }

  onlyNumber (event: KeyboardEvent): void {
    const keyCode = (event.keyCode ? event.keyCode : event.which)
    if ((keyCode < 48 || keyCode > 57) && keyCode !== 46 && keyCode !== 13 && keyCode !== 8) {
      event.preventDefault()
    }
  }
}
</script>

<style lang="scss" scoped>
.rows {
  @include row--center;
  width: 100%;
  height: 100%;
  padding: 0 10px;
  background: $colorSecondaryLight2;
  border-radius: 3px 0 0 3px;
  text-align: center;
  user-select: none;
}
</style>
