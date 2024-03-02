import { AnnotationClassPayload } from '@/store/types'
import { rgbaStringToHSLAString } from '@/utils'

export const tagBrightenedColor = (color: string): string =>
  rgbaStringToHSLAString(color, { l: 70 })

export const matchClassByName = (
  classes: AnnotationClassPayload[],
  text: string
): AnnotationClassPayload | undefined =>
  classes.find(c => c.name === text)
