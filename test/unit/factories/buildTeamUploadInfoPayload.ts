import { TeamUploadInfoPayload } from '@/store/types'

type TeamUploadInfoPayloadBuildParams = Partial<TeamUploadInfoPayload>

export const buildTeamUploadInfoPayload = (
  params: TeamUploadInfoPayloadBuildParams = {}
): TeamUploadInfoPayload => ({
  id: 'fake-uuid',
  key: 'fake_original.png',
  team_id: -1,
  type: 'annotation_class',
  upload_url: 'fake-upload-url/fake_original.png',
  url: 'fake-download-url/fake_original.png',
  ...params
})
