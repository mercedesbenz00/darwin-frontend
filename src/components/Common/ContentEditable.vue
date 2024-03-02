<template>
  <component
    :is="tag"
    ref="editable"
    class="content-editable"
    :contenteditable="!disabled"
    :placeholder="placeholder"
    @keydown.enter="onEnter"
    @input.stop.prevent="onChange"
  />
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'

/**
 * Generic componnet used to create an editable html element,
 * which doesn't necessarily have to be an input.
 *
 * # Props
 *
 * - `tag` - specifies which HTML tag to render as `contenteditable`. Defaults to `'divb'`
 * - `value` - initial value to be rendered inside the `contenteditable`
 * - `disableMultiline` - whether to enable multi-line input with enter key or not
 *
 * # Events
 *
 * - `@input`
 *   - Emitted when the value of the contenteditable changes.
 *   - Sends new value as the only argument.
 *
 * # Usage
 *
 * ```
 * <content-editable :value="'initial value'" @input='onValueChange' />
 * ```
 *
 * # Note
 *
 * Due to many edge cases of HTML content-editable, this component does not support reactivity.
 * To update it's internal value, we need to use a ref and the public `update` function it provides.
 *
 * If we need advanced `contenteditable` features, we'll need a 3rd party library.
 */
@Component({ name: 'content-editable' })
export default class ContentEditable extends Vue {
  @Prop({ required: true, type: String })
  value!: string

  @Prop({ required: false, type: String, default: '' })
  placeholder!: string

  @Prop({ required: false, type: String, default: 'div' })
  tag!: string

  @Prop({ required: false, type: Boolean, default: false })
  disableMultiline!: boolean

  @Prop({ required: false, type: Boolean, default: false })
  disabled!: boolean

  $refs!: {
    editable: HTMLElement
  }

  mounted () {
    this.update()
  }

  @Watch('value')
  onValue () {
    this.update()
  }

  public blur () {
    this.$refs.editable.blur()
  }

  public update () {
    const { editable } = this.$refs
    if (!editable) { return }
    if (editable.innerText !== this.value) {
      editable.innerHTML = this.value
    }
  }

  onEnter (evt: KeyboardEvent) {
    if (this.$listeners.enter) {
      evt.stopPropagation()
      evt.preventDefault()
      this.$emit('enter', evt)
    } else if (this.disableMultiline) {
      evt.stopPropagation()
      evt.preventDefault()
      this.$refs.editable.blur()
    }
  }

  onChange (evt: Event) {
    if (!evt.target) { return }
    const target = evt.target as HTMLElement
    this.$emit('input', target.innerText)
    this.$emit('change', target.innerText)
  }
}
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.content-editable:hover, .content-editable:focus {
  border-radius: 5px;
  padding: 5px 10px;
  background-color: $colorSecondaryLight1;
  transition: 200ms linear;
}

.content-editable:focus {
  outline: none;
  border-bottom: 1px solid $colorSecondaryLight;
  border-radius: 5px 5px 0 0;
}

.content-editable:empty:before {
  content: attr(placeholder);
  pointer-events: none;
  display: block; /* For Firefox */
}
</style>
