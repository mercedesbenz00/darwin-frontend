import { BadgeType } from '@/components/Common/Badge'
export interface InputFieldProps {
  autofocus?: boolean
  value: string | number
  error?: string
  info?: string
  warning?: string
  id?: string
  tag?: string
  placeholder?: string
  min?: number
  max?: number
  maxLength?: number
  required?: boolean
  disabled?: boolean
  type?: string
  largeNumber?: boolean
  items?: BadgeType[]
  multiple?: boolean
  wrap?: boolean
}
