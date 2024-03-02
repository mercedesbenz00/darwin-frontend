import { SubAnnotationTool, Tool } from '@/engineV2/managers/toolManager'

export const isSubAnnotationTool = (tool: Tool): tool is SubAnnotationTool =>
  'selectMasterAnnotation' in tool
