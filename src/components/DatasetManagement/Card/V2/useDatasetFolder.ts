import {
  computed,
  Ref
} from 'vue'
import { Location } from 'vue-router'

import { useRoute } from '@/composables/useRouter'
import { V2DatasetFolderPayload } from '@/store/types'
import {
  resolveFolderDMLocationV2,
  resolveOpenFolderDMLocationV2
} from '@/utils'

export interface GalleryDatasetFolderSetup {
  count: Ref<number>
  folderName: Ref<string>
  name: Ref<string>
  thumbnail: Ref<string>
  folderLocation: Ref<Location>
}

/**
 * used to provide computed data & vuex actions for dataset folder on Gallery in Card/List mode
 */
export const useDatasetFolder = (
  data: V2DatasetFolderPayload,
  readonly: Boolean = false,
  urlPrefix: string | null = null
): GalleryDatasetFolderSetup => {
  const route = useRoute()
  const count: Ref<number> = computed(() => {
    const { filtered_item_count: count, children } = data
    return (count || 0) + (children ? children.length : 0)
  })

  const folderName: Ref<string> = computed(() => {
    const segments = data.path.split('/')
    return segments[segments.length - 1]
  })

  const name: Ref<string> = computed(() => {
    return `${folderName.value} (${count.value} items)`
  })

  // use the thumbnail of the child folder if folder doesn't have thumbnail url
  const thumbnail: Ref<string> = computed(() => {
    let folder: V2DatasetFolderPayload | null = data
    while (folder && !folder.thumbnail_url) {
      folder = (folder.children && folder.children[0]) || null
    }
    return (folder && folder.thumbnail_url) || ''
  })

  const folderLocation: Ref<Location> = computed(() => {
    if (readonly && !urlPrefix) {
      throw new Error('Url prefix cannot be null')
    }
    return (readonly && urlPrefix)
      ? resolveOpenFolderDMLocationV2(route, data, urlPrefix)
      : resolveFolderDMLocationV2(route, data)
  })

  return {
    count,
    folderName,
    name,
    thumbnail,
    folderLocation
  }
}
