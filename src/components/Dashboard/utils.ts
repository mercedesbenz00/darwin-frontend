import { MetricPayload } from '@/store/types'
import { RGBA, rgbaString } from '@/utils'

import { GradientLineChartDataset } from './types'

export const metricChartData = (metric: MetricPayload): GradientLineChartDataset[] => {
  const color: RGBA = { r: 0, g: 217, b: 201, a: 1.0 }
  const gradient = { 0: rgbaString(color, 0.3), 0.5: 'rgba(255, 255, 255, 0)' }
  const fillColor = rgbaString(color, 1)

  return [{
    data: metric.data,
    label: metric.name,
    backgroundColor: { gradient: gradient },
    borderColor: fillColor,
    borderWidth: 1,
    pointRadius: 0,
    pointBackgroundColor: fillColor,
    pointBorderWidth: 0
  }]
}
