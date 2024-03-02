import { Editor } from '@/engineV2/editor'
import { Annotation, CreateAnnotationParams } from '@/engineV2/models'

type Params = Partial<CreateAnnotationParams>

export const buildV2Annotation = (
  editor: Editor,
  params: Params = {}
): Annotation | null => Annotation.createFromInstanceParams(editor.activeView, {
  type: 'bounding_box',
  classId: 1,
  data: {
    topLeft: { x: 0, y: 0, isSelected: false, isHighlighted: false },
    topRight: { x: 10, y: 0, isSelected: false, isHighlighted: false },
    bottomLeft: { x: 0, y: 10, isSelected: false, isHighlighted: false },
    bottomRight: { x: 10, y: 10, isSelected: false, isHighlighted: false }
  },
  actors: [],
  isSelected: false,
  isVisible: true,
  isHighlighted: false,
  workflowStageId: -1,
  zIndex: -1,
  ...params
})
