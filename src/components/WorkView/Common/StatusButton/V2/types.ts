import { DatasetItemStatus } from '@/store/types/DatasetItemStatus'
import { StageType } from '@/store/types/StageType'

export enum StatusButtonVariant {
  DEFAULT = 'default',
  INVERTED = 'inverted',
}

export enum StatusButtonSize {
  XS = 'xs',
  SM = 'sm',
  MD = 'md',
}

export type StatusButtonProps = {
  type: DatasetItemStatus | StageType
  size: StatusButtonSize
  variant?: StatusButtonVariant,
  active?: boolean
}
