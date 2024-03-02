export enum ProgressBarVariant {
  INACTIVE = 'inactive',
  ACTIVE = 'active'
}

export type ProgressBarProps = {
  value: number
  variant: ProgressBarVariant
}
