import { updateNodes, restoreJoints } from '@/engine/actions'
import { SkeletonNode, Skeleton } from '@/engine/plugins/skeleton/types'
import { EditablePoint } from '@/engineCommon/point'

it('updateNodes occludes a node correctly', () => {
  const point1 = new EditablePoint<'Image'>({ x: 1, y: 1 })
  const point2 = new EditablePoint<'Image'>({ x: 2, y: 2 })
  const point3 = new EditablePoint<'Image'>({ x: 3, y: 3 })
  const point4 = new EditablePoint<'Image'>({ x: 4, y: 4 })

  const nodes: SkeletonNode[] = [
    {
      name: 'one',
      point: point1,
      occluded: false
    },
    {
      name: 'two',
      point: point2,
      occluded: false
    },
    {
      name: 'three',
      point: point3,
      occluded: true
    },
    {
      name: 'four',
      point: point4,
      occluded: false
    }
  ]

  const skeleton: Skeleton = { nodes }
  const updatedNodes = updateNodes(skeleton, 1)

  expect(updatedNodes.find(n => n.name === 'one')!.occluded).toBeFalsy()
  expect(updatedNodes.find(n => n.name === 'two')!.occluded).toBeTruthy()
  expect(updatedNodes.find(n => n.name === 'three')!.occluded).toBeTruthy()
  expect(updatedNodes.find(n => n.name === 'four')!.occluded).toBeFalsy()
})

it('restoreJoints un-occludes all nodes correctly', () => {
  const point1 = new EditablePoint<'Image'>({ x: 1, y: 1 })
  const point2 = new EditablePoint<'Image'>({ x: 2, y: 2 })
  const point3 = new EditablePoint<'Image'>({ x: 3, y: 3 })
  const point4 = new EditablePoint<'Image'>({ x: 4, y: 4 })

  const nodes: SkeletonNode[] = [
    {
      name: 'one',
      point: point1,
      occluded: true
    },
    {
      name: 'two',
      point: point2,
      occluded: false
    },
    {
      name: 'three',
      point: point3,
      occluded: true
    },
    {
      name: 'four',
      point: point4,
      occluded: false
    }
  ]

  const skeleton: Skeleton = { nodes }
  expect(restoreJoints(skeleton).map(n => n.occluded)).toEqual([false, false, false, false])
})
