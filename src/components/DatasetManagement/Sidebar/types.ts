import { DatasetItemStatus } from '@/store/types'

export type ClassFilterChange = {
  positiveOptions: number[]
  negativeOptions: number[]
}

export type StatusFilterChange = {
  commented: boolean
  positiveOptions: DatasetItemStatus[]
  negativeOptions: DatasetItemStatus[]
}

export type GenericFilterChange = {
  positiveAssignees: number[]
  negativeAssignees: number[]
  positiveFilenames: string[]
  negativeFilenames: string[]
  positivePaths: string[]
  negativePaths: string[]
}
