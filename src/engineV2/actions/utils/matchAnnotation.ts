import { View } from '@/engineV2/views'

export const matchAnnotation = (view: View, id: string) => {
  const { annotations } = view.annotationManager
  return annotations.find(a => a.id === id)
}
