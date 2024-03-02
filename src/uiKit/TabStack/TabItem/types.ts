export enum TabSize {
  SMALL = 'small',
  LARGE = 'large'
}

export type TabItemProps = {
  id: string
  label: string
  size: TabSize
  active?: boolean
}
