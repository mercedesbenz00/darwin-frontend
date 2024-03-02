import { ThemeType } from '@/plugins/theme'

export const useTheme = (): ThemeType =>{
  return {
    theme: 'darwin',
    fonts: { default: 'Muli', headlines: 'Muli', source: 'Muli' },
    getBreakpoint: () => 1440,
    getCurrentBreakpoint: () => 'xxl',
    getCurrentBreakpointFontSize: () => 16,
    getScale: () => 1,
    getCurrentScale: () => 1,
    getRootFont: () => 14,
    getColor: () => '#ffffff',
    getShadow: () => '0px 3px 10px -1px rgba(49, 51, 53, 0.14)',
    getSidebarExpandedWidth: () => 250,
    getSidebarCollapsedWidth: () => 70,
  }
}
