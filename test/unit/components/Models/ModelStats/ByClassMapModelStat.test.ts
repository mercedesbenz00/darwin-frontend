import { createLocalVue, shallowMount } from '@vue/test-utils'
import { cloneDeep, merge } from 'lodash'

import { buildTrainedModelPayload } from 'test/unit/factories'

import ByClassMapModelStat from '@/components/Models/ModelStats/ByClassMapModelStat.vue'
import {
  DatasetReportClassDistributionPayload,
  TrainedModelPayload
} from '@/store/types'

const localVue = createLocalVue()

const datasetDistributions: DatasetReportClassDistributionPayload[] = [
  { id: 1, name: 'DNA Band', count: 600 }
]

const trainedModel = buildTrainedModelPayload({
  training_result: {
    segm: {
      AP: 31.629854440689087,
      AP50: 100,
      AP75: 0
    },
    classes: [
      'background',
      'DNA Band'
    ],
    'test/f1': 1,
    'test/map': [0.31629854440689087],
    'test/mar_1': [0.0833333358168602],
    'test/map_50': [1],
    'test/map_75': [0],
    'test/mar_10': [0.3333333432674408],
    'test/recall': 1,
    'test/mar_100': [0.36666667461395264],
    'test/accuracy': 1,
    'test/micro-f1': 1,
    'test/map_large': [-1],
    'test/map_small': [-1],
    'test/mar_large': [-1],
    'test/mar_small': [-1],
    'test/map_medium': [0.3171617090702057],
    'test/mar_medium': [0.36666667461395264],
    'test/micro-recall': 1,
    'test/map_per_class': [0.31629854440689087],
    'test/micro-accuracy': 1,
    'test/confusion_matrix': [
      [0, 0],
      [0, 6]
    ],
    'test/mar_100_per_class': [0.36666667461395264],
    'test/confusion_matrix_norm': [
      [0, 0],
      [0, 1]
    ]
  }
})

const noMapTrainedModel = buildTrainedModelPayload(
  merge(
    cloneDeep(trainedModel.training_result),
    {
      'test/map_per_class': undefined
    }
  )
)

let propsData: {
  trainedModel: TrainedModelPayload | null,
  datasetDistributions: DatasetReportClassDistributionPayload[] | null
}

const itMatchesSnapshot = () => it('matches snapshot', () => {
  const wrapper = shallowMount(ByClassMapModelStat, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

const itRenders = (title: string, selector: string, values: string[]) => {
  return () => it(`renders ${title}`, () => {
    const wrapper = shallowMount(ByClassMapModelStat, { localVue, propsData })
    expect(wrapper.findAll(selector).wrappers.map(item => item.text())).toStrictEqual(values)
  })
}

const itRendersNo = (title: string, selector: string) => {
  return () => it(`renders no ${title}`, () => {
    const wrapper = shallowMount(ByClassMapModelStat, { localVue, propsData })
    expect(wrapper.find(selector).exists()).toBeFalsy()
  })
}

const itRendersClasses = itRenders(
  'classes',
  '.by-class-map__class span:first-child',
  ['DNA Band']
)

const itRendersNoClasses = itRendersNo(
  'classes',
  '.by-class-map__class span:first-child'
)

const itRendersCounts = itRenders(
  'counts',
  '.by-class-map__class span:last-child',
  ['600']
)

const itRendersEmptyCounts = itRenders(
  'counts',
  '.by-class-map__class span:last-child',
  ['']
)

const itRendersNoCounts = itRendersNo(
  'counts',
  '.by-class-map__class span:last-child'
)

const itRendersMeanAPs = itRenders(
  'mAPs',
  '.by-class-map__precision',
  ['0.316']
)

const itRendersNoMeanAPs = itRendersNo(
  'mAPs',
  '.by-class-map__precision'
)

const itRendersMeanARs = itRenders(
  'mARs',
  '.by-class-map__recall',
  ['0.367']
)

const itRendersNoMeanARs = itRendersNo(
  'mARs',
  '.by-class-map__recall'
)

describe('when given proper data', () => {
  beforeEach(() => {
    propsData = {
      trainedModel,
      datasetDistributions
    }
  })

  itMatchesSnapshot()
  itRendersClasses()
  itRendersCounts()
  itRendersMeanAPs()
  itRendersMeanARs()
})

describe('when distributions are empty', () => {
  beforeEach(() => {
    propsData = {
      trainedModel,
      datasetDistributions: []
    }
  })

  itMatchesSnapshot()
  itRendersClasses()
  itRendersEmptyCounts()
  itRendersMeanAPs()
  itRendersMeanARs()
})

describe('when maps is empty', () => {
  beforeEach(() => {
    propsData = {
      trainedModel: noMapTrainedModel,
      datasetDistributions
    }
  })

  itMatchesSnapshot()
  itRendersNoClasses()
  itRendersNoCounts()
  itRendersNoMeanAPs()
  itRendersNoMeanARs()
})
