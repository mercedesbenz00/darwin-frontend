import { shallowMount, createLocalVue } from '@vue/test-utils'
import moment from 'moment'

import { buildMembershipPayload } from 'test/unit/factories'

import DimensionSelector from '@/components/Annotators/AnnotationMetrics/AnnotatorStats/DimensionSelector.vue'
import { ChartDimension, AnnotationChartData, AdaptedDataPoint } from '@/components/Annotators/AnnotationMetrics/types'
import { defaultData, getDimensionsData, adaptReportData } from '@/components/Annotators/AnnotationMetrics/utils'

const localVue = createLocalVue()
localVue.directive('tooltip', () => {})

const sam = buildMembershipPayload({ id: 1, email: 'sam@v7labs.com' })

const dimensions: ChartDimension[] = ['annotationTime', 'annotationsCreated', 'avgTimePerAnnotation', 'imagesAnnotated', 'reviewPassRate']

const buildPropsData =
  (chartData: Partial<AnnotationChartData>, dimension: ChartDimension): { chartData: AnnotationChartData, dimension: ChartDimension } => ({
    chartData: {
      member: sam,
      data: [],
      visible: true,
      dimensions: {
        annotationTime: 0,
        annotationsCreated: 0,
        avgTimePerAnnotation: null,
        imagesAnnotated: 0,
        reviewPassRate: null
      },
      ...chartData
    },
    dimension
  })

dimensions.forEach(dimension => {
  it(`matches snapshot for ${dimension}`, () => {
    const wrapper = shallowMount(DimensionSelector, {
      localVue, propsData: buildPropsData({}, dimension)
    })
    expect(wrapper).toMatchSnapshot()
  })
})

it('matches snapshot when hidden', () => {
  const propsData = buildPropsData({ visible: false }, 'annotationTime')
  const wrapper = shallowMount(DimensionSelector, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when slot provided', () => {
  const propsData = buildPropsData({ visible: false }, 'annotationTime')
  const slots = { default: '<div>Default slot</div>' }
  const wrapper = shallowMount(DimensionSelector, { localVue, propsData, slots })
  expect(wrapper).toMatchSnapshot()
})

it('emits event when dimension is clicked', () => {
  const select = jest.fn()
  const wrapper = shallowMount(DimensionSelector, {
    localVue, propsData: buildPropsData({}, 'annotationTime'), listeners: { select }
  })

  expect(wrapper.emitted().select).toBeUndefined()

  wrapper.findAll('button').at(0).trigger('click')
  expect(select).toHaveBeenCalledWith('annotationTime')

  wrapper.findAll('button').at(1).trigger('click')
  expect(select).toHaveBeenCalledWith('annotationsCreated')

  wrapper.findAll('button').at(2).trigger('click')
  expect(select).toHaveBeenCalledWith('avgTimePerAnnotation')

  wrapper.findAll('button').at(3).trigger('click')
  expect(select).toHaveBeenCalledWith('imagesAnnotated')
})

describe('metric computation', () => {
  const defaultDataPoint: AdaptedDataPoint =
    adaptReportData(defaultData(sam, moment.utc().format('YYYY-MM-DDT00:00:00.000000')))

  const buildProps = (data: Partial<AdaptedDataPoint>[], dimension: ChartDimension) => {
    const fullData: AdaptedDataPoint[] = data.map(d => ({ ...defaultDataPoint, ...d }))
    return {
      chartData: {
        member: sam,
        data: fullData,
        dimensions: getDimensionsData(fullData),
        visible: true
      },
      dimension
    }
  }

  it('computes reviewPassRate correctly', () => {
    const data: Partial<AdaptedDataPoint>[] = [
      { annotationsCreated: 1, reviewPassRate: 100 },
      { reviewPassRate: null }
    ]
    const propsData = buildProps(data, 'reviewPassRate')
    const wrapper = shallowMount(DimensionSelector, { localVue, propsData })

    const index =
      (wrapper.vm as any).options.findIndex((o: any) => o.dimension === 'reviewPassRate')

    const optionWrapper = wrapper.findAll('.selector__options__option').at(index)
    expect(optionWrapper.text()).toEqual('100.0%')
  })

  it('computes annotation time correctly if total is more than a month', () => {
    const secondsInDay = 24 * 3600
    const data: Partial<AdaptedDataPoint>[] =
      [{ annotationTime: 17 * secondsInDay }, { annotationTime: 18 * secondsInDay }]

    const propsData = buildProps(data, 'annotationTime')
    const wrapper = shallowMount(DimensionSelector, { localVue, propsData })

    const index =
      (wrapper.vm as any).options.findIndex((o: any) => o.dimension === 'annotationTime')

    const optionWrapper = wrapper.findAll('.selector__options__option').at(index)
    expect(optionWrapper.text()).toEqual('35d 0h 0m')
  })
})
