import { UserAction } from '@/store/modules/user/types'
import { UserPayload } from '@/store/types/UserPayload'
import { api, errorMessages, isErrorResponse, parseError } from '@/utils'

export type UpdateProfileActionParams = {
  /* eslint-disable camelcase */
  first_name: string
  last_name: string

  two_factor_auth_enabled: boolean

  old_password?: string
  password?: string
  password_confirmation?: string

  hash?: string
  content?: File
  type?: string | null

  show_notifications?: boolean
  /* eslint-enable camelcase */
}

type UpdateProfile = UserAction<UpdateProfileActionParams, UserPayload>

export const updateProfile: UpdateProfile = async ({ commit, dispatch }, params) => {
  let response

  try {
    response = await api.put<UserPayload>('users/profile', params)
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.PROFILE_UPDATE)
  }

  const { data } = response

  commit('SET_PROFILE', data)

  if (!(params.hash && params.content && params.type && data.image!.upload_url)) {
    return { data }
  }

  const avatarUploadResponse = await dispatch('uploadProfileAvatar', {
    content: params.content,
    type: params.type
  })

  if ('error' in avatarUploadResponse) {
    return avatarUploadResponse
  }

  return { data }
}
