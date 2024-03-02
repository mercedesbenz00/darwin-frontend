import { v4 } from 'uuid'

import { TableHeaderItem } from '@/components/Common/Table/V2/TableHeader'

type Params = Partial<TableHeaderItem>
const buildTableHeaderRow = (params: Params = {}): TableHeaderItem => ({
  label: 'Foo',
  id: '',
  tableId: '',
  totalItems: 0,
  minColumnSize: 312,
  sortAction: () => {},
  resizeable: true,
  ...params
})

export function useTable (): { tableId: string; headerRow: TableHeaderItem[] } {
  const tableId = v4()
  const headerRow = [
    buildTableHeaderRow({ label: 'Name', id: 'name', tableId, totalItems: 6 }),
    buildTableHeaderRow({ label: 'Status', minColumnSize: 200, tableId, totalItems: 6 }),
    buildTableHeaderRow({ label: 'Tags', minColumnSize: 200, tableId, totalItems: 6 }),
    buildTableHeaderRow({
      label: 'Date Created',
      id: 'id',
      minColumnSize: 136,
      tableId,
      totalItems: 6
    }),
    buildTableHeaderRow({
      label: 'Date Modified',
      id: 'updated_at',
      minColumnSize: 136,
      tableId,
      totalItems: 6
    }),
    buildTableHeaderRow({
      label: 'File Size',
      id: 'byte_size',
      minColumnSize: 136,
      tableId,
      totalItems: 6
    })
  ]

  return { tableId, headerRow }
}
