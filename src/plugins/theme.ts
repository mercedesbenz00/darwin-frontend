import _Vue, { PluginObject } from 'vue'

import fonts from '@/assets/styles/darwin/typography/typography.global.module.scss'
import colors from '@/assets/styles/darwin/variables/colors.module.scss'
import shadows from '@/assets/styles/darwin/variables/shadows.module.scss'
import styles from '@/assets/styles/ui.module.scss'

const Theme: PluginObject<{}> = {
  install: (Vue: typeof _Vue) => {
    Vue.prototype.$theme = {
      theme: 'darwin',
      fonts,
      shadows,
      breakpoints: ['xvl', 'xivl', 'xxxl', 'xxl', 'xl', 'lg', 'normal'],
      /* Returns screen width for breakpoint
       * ...
       * key: xxl => 1440px
       * ...
       */
      getBreakpoint (key: string): number {
        return parseInt(styles[`breakpoint_${key}`].replace('px', ''))
      },
      /* Returns breakpoint name from the current screen width
       * ...
       * screen width = 1440px => xxl
       * ...
       */
      getCurrentBreakpoint (): string {
        for (const mq of this.breakpoints) {
          if (window.innerWidth >= this.getBreakpoint(mq)) {
            return mq
          }
        }
        return this.breakpoints[this.breakpoints.length - 1]
      },
      /* Returns scale value from the breakpoint
       * ...
       * key: xxl => 1
       * ...
       */
      getScale (key: string): number {
        return parseFloat(styles[`scale_${key}`])
      },
      /* Returns scale value from the current screen width
       * ...
       * screen width = 1440px => 1
       * ...
       */
      getCurrentScale (): number {
        return this.getScale(this.getCurrentBreakpoint())
      },
      /* Returns root font size
       * 16px by default
       */
      getRootFont (): number {
        return parseInt(styles.rootFont) / 16
      },
      /* Returns calculated size of font breakpoint in pixels on the current screen width
       * md-1(14px) & xs(0.7) screen => 9.8px
       * ...
       * md-1(14px) & lg(1) screen => 14px
       * ...
       * lg(16px) & lg(1) screen => 16px
       * ...
       */
      getCurrentBreakpointFontSize (key: string): number {
        return parseFloat(styles[`font_${key}`]) * this.getRootFont() * this.getCurrentScale()
      },
      /* Returns a hex color for the current theme */
      getColor (name: string): string {
        return colors[name]
      },
      /* Returns a shadow */
      getShadow (name: string): string {
        return shadows[name]
      },
      getSidebarExpandedWidth (): number {
        return (
          parseFloat(styles.sidebar_expanded_width) *
          this.getRootFont() *
          this.getCurrentScale()
        )
      },
      getSidebarCollapsedWidth (): number {
        return (
          parseFloat(styles.sidebar_collapsed_width) *
          this.getRootFont() *
          this.getCurrentScale()
        )
      }
    }
  }
}

export default Theme

export declare class ThemeType {
  static install(Vue: typeof _Vue): void;
  getBreakpoint: (key: string) => number;
  getCurrentBreakpoint: () => string;
  getScale: (key: string) => number;
  getCurrentScale: () => number;
  getRootFont: () => number;
  getCurrentBreakpointFontSize: (key: string) => number;
  getColor: (name: string) => string;
  getShadow: (name: string) => string;
  getSidebarExpandedWidth: () => number;
  getSidebarCollapsedWidth: () => number;
  theme: string;
  fonts: { default: string, headlines: string, source: string }
}

declare module 'vue/types/vue' {
  interface Vue {
    $theme: ThemeType;
  }
}
