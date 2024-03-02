import { Component, Prop, Vue } from 'vue-property-decorator'
import { Location } from 'vue-router'

import { DatasetFolderPayload } from '@/store/types'
import {
  resolveFolderDMLocation,
  resolveOpenFolderDMLocation
} from '@/utils'

/**
 * Mixin used to provide computed data & vuex actions for dataset
 * folder on Gallery in Card/List mode
 */
@Component
export default class GalleryDatasetFolder extends Vue {
  @Prop({ required: true })
  data!: DatasetFolderPayload

  @Prop({ type: Boolean, default: false })
  readonly!: boolean

  @Prop({ default: null })
  urlPrefix!: string | null

  get count () {
    const { direct_item_count_filtered: count, children } = this.data
    return (count || 0) + (children ? children.length : 0)
  }

  get folderName () {
    const segments = this.data.path.split('/')
    return segments[segments.length - 1]
  }

  get name () {
    const { count, folderName } = this
    return `${folderName} (${count} items)`
  }

  // use the thumbnail of the child folder if folder doesn't have thumbnail url
  get thumbnail () {
    let folder: DatasetFolderPayload | undefined = this.data
    while (folder && !folder.url) {
      folder = folder.children && folder.children[0]
    }
    return folder && folder.url
  }

  get folderLocation (): Location {
    const { $route, data, readonly, urlPrefix } = this
    if (readonly && !urlPrefix) {
      throw new Error('Url prefix cannot be null')
    }
    return (readonly && urlPrefix)
      ? resolveOpenFolderDMLocation($route, data, urlPrefix)
      : resolveFolderDMLocation($route, data)
  }
}
