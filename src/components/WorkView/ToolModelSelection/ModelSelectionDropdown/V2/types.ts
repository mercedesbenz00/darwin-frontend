import { ModelType } from '@/store/types'
import { RGBA } from '@/utils'

export type ModelSelectionDropdownClassOption = {
  color: RGBA
  label: string
}

export type ModelSelectionDropdownOption = {
  id: string
  label: string
  type: ModelType
  classes: ModelSelectionDropdownClassOption[]
}
