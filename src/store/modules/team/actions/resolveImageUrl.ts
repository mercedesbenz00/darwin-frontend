import {
  RegisterTeamParams,
  TeamAction,
  TeamWithAvatarUploadParams
} from '@/store/modules/team/types'
import { api } from '@/utils'

type Payload = {
  data: TeamWithAvatarUploadParams
  params: RegisterTeamParams
}

/**
 * Upload team avatar
 */
export const resolveImageUrl: TeamAction<Payload, void> =
  async ({ commit }, { data, params }) => {
    if (!data.image || !data.image.upload_url) { return }

    const { upload_url: uploadUrl } = data.image

    await api.uploadToS3(uploadUrl, params.content, params.type)
    await api.post(`teams/${data.id}/confirm_avatar_uploaded`)

    commit('SET_TEAM_AVATAR_URL', data.image.url)
  }
