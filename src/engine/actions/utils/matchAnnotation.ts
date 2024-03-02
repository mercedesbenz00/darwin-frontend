import { Editor } from '@/engine/editor'
import { Annotation } from '@/engine/models'

export const matchAnnotation = (editor: Editor, id: string): Annotation | undefined => {
  const { annotations } = editor.activeView
  return annotations.find(a => a.id === id)
}
