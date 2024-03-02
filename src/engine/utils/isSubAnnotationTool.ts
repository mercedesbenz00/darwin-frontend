import { SubAnnotationTool, Tool } from '@/engine/managers/toolManager'

export const isSubAnnotationTool = (tool: Tool): tool is SubAnnotationTool =>
  'selectMasterAnnotation' in tool
