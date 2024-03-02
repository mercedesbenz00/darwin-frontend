export enum SegmentedControlVariant {
  SMALL = 'small',
  LARGE = 'large'
}

export type SegmentedControl = {
  id: string
  tabs: Tab[]
  variant?: SegmentedControlVariant
  activeIndex?: number
}

export type Tab = {
  id: string
  label: string | null
  iconName: string | null
}
