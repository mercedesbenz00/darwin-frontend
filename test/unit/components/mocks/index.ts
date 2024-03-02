import { ThemeType } from '@/plugins/theme'

export const createMockTheme = (): ThemeType => ({
  theme: 'darwin',
  fonts: { default: 'Muli', headlines: 'Muli', source: 'Muli' },
  getBreakpoint: jest.fn().mockReturnValue('1440px') as jest.MockedFunction<ThemeType['getBreakpoint']>,
  getCurrentBreakpoint: jest.fn().mockReturnValue('xxl') as jest.MockedFunction<ThemeType['getCurrentBreakpoint']>,
  getCurrentBreakpointFontSize: jest.fn().mockReturnValue(16) as jest.MockedFunction<ThemeType['getCurrentBreakpointFontSize']>,
  getScale: jest.fn().mockReturnValue(1) as jest.MockedFunction<ThemeType['getScale']>,
  getCurrentScale: jest.fn().mockReturnValue(1) as jest.MockedFunction<ThemeType['getCurrentScale']>,
  getRootFont: jest.fn().mockReturnValue('14px') as jest.MockedFunction<ThemeType['getRootFont']>,
  getColor: jest.fn().mockReturnValue('#ffffff') as jest.MockedFunction<ThemeType['getColor']>,
  getShadow: jest.fn().mockReturnValue('0px 3px 10px -1px rgba(49, 51, 53, 0.14)') as jest.MockedFunction<ThemeType['getShadow']>,
  getSidebarExpandedWidth: jest.fn().mockReturnValue(250) as jest.MockedFunction<ThemeType['getSidebarExpandedWidth']>,
  getSidebarCollapsedWidth: jest.fn().mockReturnValue(70) as jest.MockedFunction<ThemeType['getSidebarCollapsedWidth']>
})
