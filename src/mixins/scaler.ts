import Vue from 'vue'
import Component from 'vue-class-component'

// You can declare a mixin as the same style as components.
@Component
export default class Scaler extends Vue {
  public created () {
    this.resize()
    window.addEventListener('resize', this.resize)
  }

  public beforeDestroy () {
    window.removeEventListener('resize', this.resize)
  }

  protected resize () {}

  protected breakpoint () {
    return this.$theme.getCurrentBreakpoint()
  }

  protected getScale () {
    return this.$theme.getCurrentScale()
  }
}
