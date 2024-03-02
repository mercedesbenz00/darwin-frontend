import { buildTrainedModelPayload } from 'test/unit/factories'

import { DatasetReportClassDistributionPayload } from '@/store/types'

import ByClassMapModelStat from './ByClassMapModelStat.vue'

export default {
  title: 'Models/ModelStats/ByClassMapModelStat'
}

export const Default = () => {
  const datasetDistributions: DatasetReportClassDistributionPayload[] = [
    { id: 1, name: 'DNA Band', count: 600 }
  ]

  const trainedModel = buildTrainedModelPayload({
    classes: [
      {
        id: '1',
        name: 'DNA Band',
        type: 'bounding_box',
        subs: []
      }
    ],
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

  return {
    components: { ByClassMapModelStat },
    data () { return { trainedModel, datasetDistributions } },
    template: `
      <div style="background-color: #f0e6d5; padding: 50px;">
        <by-class-map-model-stat
          :trained-model="trainedModel"
          :dataset-distributions="datasetDistributions"
        />
      </div>
    `
  }
}
