import Chart from 'chart.js'

export type DataPointItem = {
  color?: string
  label: string
  type?: string
  value: number | null
}

export type DonutChartDataItem = {
  color: string
  value: number
}

export type GradientLineChartDataset =
  Omit<Chart.ChartDataSets, 'backgroundColor'> &
  { backgroundColor: { gradient: { [i in number]: string }}}

export type ChartData = { datasets: GradientLineChartDataset[] }
