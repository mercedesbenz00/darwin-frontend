<template>
  <div
    ref="editable"
    contenteditable
    :style="computedStyles"
    @focus="resize"
    @input.stop.prevent="onInput"
    @keydown.stop="$event => $emit('keydown', $event)"
    @keypress.stop
    @keyup.stop
  />
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop } from 'vue-property-decorator'

@Component({ name: 'textarea-auto-size' })
export default class TextareaAutosize extends Vue {
  /*
   * Property to accept value from parent
   */
  @Prop({ required: false, default: '' })
  value!: string;

  /*
   * Allow to enable/disable auto resizing dynamically
   */
  @Prop({ required: false, default: true })
  autosize!: boolean;

  /*
   * Min textarea height
   */
  @Prop({ required: false, default: null })
  minHeight!: number;

  /*
   * Max textarea height
   */
  @Prop({ required: false, default: null })
  maxHeight!: number;

  /*
   * Force !important for style properties
   */
  @Prop({ required: false, default: false })
  important!: boolean | string[];

  $refs!: {
    editable: HTMLElement
  }

  internalValue: string | number | null = null;
  maxHeightScroll: boolean = false;

  get computedStyles () {
    type StyledObject = {
      resize?: string,
      overflow?: string
    }

    const objStyles: StyledObject = {}
    if (this.autosize) {
      objStyles.resize = !this.isResizeImportant ? 'none' : 'none !important'
      if (!this.maxHeightScroll) {
        objStyles.overflow = !this.isOverflowImportant ? 'hidden' : 'hidden !important'
      }
    }
    return objStyles
  }

  get isResizeImportant () {
    const imp = this.important
    return imp === true || (Array.isArray(imp) && imp.includes('resize'))
  }

  get isOverflowImportant () {
    const imp = this.important
    return imp === true || (Array.isArray(imp) && imp.includes('overflow'))
  }

  get isHeightImportant () {
    const imp = this.important
    return imp === true || (Array.isArray(imp) && imp.includes('height'))
  }

  @Watch('value')
  onValue () {
    this.update()
    this.resize()
  }

  public update () {
    if (!this.$refs.editable) { return }
    if (this.$refs.editable.innerHTML !== this.value) {
      this.$refs.editable.innerHTML = this.value
    }
  }

  onInput (event: Event) {
    if (!event.target) { return }
    const target = event.target as HTMLElement
    this.$emit('input', target.innerHTML)
    this.$emit('change', {
      html: target.innerHTML,
      text: target.innerText
    })
  }

  mounted () {
    this.update()
    this.resize() // perform initial height adjustment
  }

  /*
   * Auto resize textarea by height
   */
  resize () {
    const important = this.isHeightImportant ? '!important' : ''
    const element = this.$el as HTMLElement
    element.style.height = `auto ${important}`

    let contentHeight = this.$el.scrollHeight + 1
    if (this.minHeight) {
      contentHeight = contentHeight < this.minHeight ? this.minHeight : contentHeight
    }
    if (this.maxHeight) {
      if (contentHeight > this.maxHeight) {
        contentHeight = this.maxHeight
        this.maxHeightScroll = true
      } else {
        this.maxHeightScroll = false
      }
    }
    element.style.height = `${contentHeight}px ${important}`
    return this
  }
}
</script>
