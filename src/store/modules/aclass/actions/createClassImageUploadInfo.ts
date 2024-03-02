import { AClassAction } from '@/store/modules/aclass/types'
import { TeamPayload } from '@/store/types/TeamPayload'
import { TeamUploadInfoPayload } from '@/store/types/TeamUploadInfoPayload'
import { constructError } from '@/utils'
import { createUploadInfo } from '@/utils/backend'

type Payload = {
  team: TeamPayload,
  type: Parameters<typeof createUploadInfo>[0]['type']
  id?: string
}
/**
 * Update the attribute with the new details
 * @param {integer} annotationClassId containing the attribute
 * @param {string} id the id of the attribute to update
 */
export const createClassImageUploadInfo: AClassAction<Payload, TeamUploadInfoPayload> =
  async (context, payload) => {
    const response = await createUploadInfo({
      teamSlug: payload.team.slug,
      type: payload.type,
      ...(payload.id && { id: payload.id })
    })

    if ('data' in response) {
      return response
    }

    return constructError('ANNOTATION_CLASS_THUMBNAIL_UPLOAD_FAILED')
  }
