import Vue from 'vue'
import Component from 'vue-class-component'

// You can declare a mixin as the same style as components.
@Component
export default class Scaler extends Vue {
  protected mqMargins: any = {
    lg: 14, xl: 17, xxl: 17, xxxl: 17, xivl: 17, xvl: 17
  };

  protected mqColumns: any = {
    lg: 3, xl: 3, xxl: 4, xxxl: 5, xivl: 6, xvl: 10
  }

  protected columns (breakpoint: string) {
    return this.mqColumns[breakpoint] || 1
  }

  // offset is value to add or remove(padding or margin)
  protected colWidth (breakpoint: string, offset: number) {
    const percent = (100.00 / this.columns(breakpoint)).toFixed(2)
    const sign = offset < 0 ? '+' : '-'
    const val = Math.abs(offset)
    return `calc(${percent}% ${sign} ${val}px)`
  }
}
