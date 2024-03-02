import { BottomBarItem } from '@/components/WorkView/BottomBar/types'
import { DatasetItemPayload } from '@/store/types'

export const bottomBarItems: BottomBarItem[] = [
  {
    id: '1',
    data: <DatasetItemPayload>{
      archived: false,
      archived_reason: null,
      current_workflow: null,
      current_workflow_id: null,
      dataset_id: 1,
      dataset_image: {
        dataset_id: 1,
        dataset_video_id: null,
        id: 1,
        image: {
          external: false,
          height: 480,
          id: 1,
          key: '/static/test.png',
          original_filename: '/static/test.png',
          thumbnail_url: '/static/test.png',
          width: 480
        },
        seq: 2,
        set: 1648636325
      }
    }
  }
]
