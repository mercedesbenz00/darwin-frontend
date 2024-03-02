export type SortOptions = {
  search: '',
  sortBy: SortBy,
  sortDirection: SortDirection
}

export enum SortBy {
  NAME = 'name',
  CREATED = 'inserted_at',
  MODIFIED = 'updated_at'
}

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc'
}
