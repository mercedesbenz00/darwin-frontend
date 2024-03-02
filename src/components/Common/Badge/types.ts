import { RGBA } from '@/utils'

export type ParsedColorType = {
  bg: string,
  text: string
}

export type BadgeType = {
  id?: string,
  label: string,
  color?: RGBA
  size?: 'small' | 'medium' | 'large'
  highContrast?: boolean
}

export enum BadgeSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
}

export enum BadgeTag {
  A = 'a',
  DIV = 'div',
  ROUTER_LINK = 'router-link',
  BUTTON = 'button'
}

export interface BadgesProps {
  items: BadgeType[],
  selected?: boolean,
  wrap?: boolean
}

export interface BadgeProps {
  label: string,
  color?: RGBA,
  size?: string,
  tag?: string,
  tooltip?: string,
  highContrast?: boolean,
  overrideLabelColor?: string,
  deletable?: boolean,
  noTooltip?: boolean,
  alpha?: number
}
