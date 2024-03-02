import { ToolConfig } from '@/engine/managers'
import { AnnotationTypeName } from '@/store/types'

export const buildToolConfigEntry = (
  name: string,
  annotationTypes: AnnotationTypeName[] = ['polygon']
): ToolConfig => {
  return {
    name: name,
    icon: 'select',
    toolTip: 'my tooltip',
    keybindings: [],
    annotationTypes,
    sub: false,
    disabled: false
  }
}
