import { formatTypeName } from '@/utils'

it('formats annotation type names correctly', () => {
  expect(formatTypeName('bounding_box')).toEqual('Bounding Box')
  expect(formatTypeName('instance_id')).toEqual('Instance ID')
  expect(formatTypeName('tag')).toEqual('Tag')
  expect(formatTypeName('polygon')).toEqual('Polygon')
})
