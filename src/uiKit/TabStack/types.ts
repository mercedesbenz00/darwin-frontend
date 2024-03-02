import { TabItemProps } from './TabItem/types'

export type TabStackProps = {
  tabs: Omit<TabItemProps, 'size' | 'active'>[]
  size: TabItemProps['size']
  activeTab: number
}
