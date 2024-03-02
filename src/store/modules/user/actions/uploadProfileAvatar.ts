import { UserAction } from '@/store/modules/user/types'
import { UserPayload } from '@/store/types/UserPayload'
import { api, errorMessages, isErrorResponse, parseError } from '@/utils'

export type UploadProfileAvatarActionParams = {
  content: File
  type: string | null
}

type UploadProfileAvatar = UserAction<UploadProfileAvatarActionParams, UserPayload>

export const uploadProfileAvatar: UploadProfileAvatar = async ({ commit, state }, params) => {
  if (!state.profile) {
    throw new Error('Should log in first to upload profile avatar')
  }

  if (!state.profile.image || !state.profile.image.upload_url) {
    throw new Error('Profile Image should be defined to upload profile avatar')
  }

  // profile update involved an avatar change
  try {
    await api.uploadToS3(state.profile.image.upload_url, params.content, params.type)
    await api.post('users/confirm_avatar_uploaded')
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.PROFILE_UPDATE)
  }
  const imageUrl = state.profile.image.url

  if (imageUrl) { commit('SET_PROFILE_AVATAR_URL', imageUrl) }

  const memberAvatarParams = {
    id: state.profile.id,
    image: {
      ...state.profile.image,
      url: state.profile.image.url
    }
  }
  commit('team/SET_MEMBER_AVATAR_URL', memberAvatarParams, { root: true })

  return { data: state.profile }
}
