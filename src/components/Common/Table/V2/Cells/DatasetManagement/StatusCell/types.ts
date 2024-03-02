import { StatusButtonProps } from '@/components/WorkView/Common/StatusButton/V2'

export type StatusCellProps = {
  status: StatusButtonProps['type']
  url: string | null
  name: string
}
