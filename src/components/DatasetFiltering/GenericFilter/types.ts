import { DropdownOption } from '@/components/Common/Dropdown/types'
import { DatasetFolderPayload, V2DatasetFolderPayload } from '@/store/types'
import { DatasetItemFilenamePayload } from '@/store/types/DatasetItemFilenamePayload'
import { MembershipPayload } from '@/store/types/MembershipPayload'

export type GenericFilterOptionType = Omit<DropdownOption, 'data'> & {
  type: 'assignees' | 'filenames' | 'paths'
  includeHeader: boolean
  data:
    MembershipPayload |
    DatasetItemFilenamePayload |
    DatasetFolderPayload |
    V2DatasetFolderPayload
}
