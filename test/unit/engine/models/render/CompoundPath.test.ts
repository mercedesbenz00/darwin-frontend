import { compoundPathOuterBox } from '@/engine/models'
import { EditablePoint } from '@/engineCommon/point'
const examples = [
  {
    input: {
      path: [
        new EditablePoint<'Image'>({ x: 2, y: 2 }),
        new EditablePoint<'Image'>({ x: 27, y: 0 }),
        new EditablePoint<'Image'>({ x: 15, y: 1 })
      ],
      additionalPaths: []
    },
    output: {
      xmin: 2,
      ymin: 0,
      xmax: 27,
      ymax: 2
    }
  },
  {
    input: {
      path: [
        new EditablePoint<'Image'>({ x: 2, y: 2 }),
        new EditablePoint<'Image'>({ x: 27, y: 0 }),
        new EditablePoint<'Image'>({ x: 15, y: 1 })
      ],
      additionalPaths: [
        [
          new EditablePoint<'Image'>({ x: -2, y: 22 }),
          new EditablePoint<'Image'>({ x: 2, y: 10 }),
          new EditablePoint<'Image'>({ x: 80, y: -1 })
        ]
      ]
    },
    output: {
      xmin: -2,
      ymin: -1,
      xmax: 80,
      ymax: 22
    }
  }
]

it('computes correct outer box for compund path', () => {
  examples.forEach(e =>
    expect(compoundPathOuterBox(e.input)).toEqual(e.output)
  )
})
