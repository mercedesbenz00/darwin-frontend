import { BadgeType } from '@/components/Common/Badge'

export interface TextInputProps {
  autofocus?: boolean
  value: string | number
  error?: string
  info?: string
  warning?: string
  id?: string
  tag?: string
  label?: string
  placeholder?: string
  min?: number
  max?: number
  maxLength?: number
  required?: boolean
  optional?: boolean
  disabled?: boolean
  type?: string
  largeNumber?: boolean
  items?: BadgeType[]
  multiple?: boolean
  wrap?: boolean
}
