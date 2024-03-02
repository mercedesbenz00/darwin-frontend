import { DropdownOption } from '@/components/Common/Dropdown/types'

export type ExportFormatPillType = {
  name: string;
  type: 'feather-light' | 'pink' | 'yellow';
}

export type ExportFormatOptionType = DropdownOption & {
  id: string
  label: string
  pills?: ExportFormatPillType[]
}
