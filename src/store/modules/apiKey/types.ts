import { RootState, TypedAction, TypedMutation } from '@/store/types'

export type AbilityID =
  'archive_dataset_items' |
  'archive_dataset' |
  'archive_team' |
  'assign_items' |
  'create_annotation_class' |
  'create_comment_thread' |
  'create_comment' |
  'create_dataset' |
  'create_team' |
  'delete_annotation_class' |
  'delete_comment_thread' |
  'delete_comment' |
  'delete_dataset_items' |
  'delete_membership' |
  'deploy_model' |
  'export_dataset' |
  'fork_dataset' |
  'import_annotations' |
  'manage_admin_invitations' |
  'manage_customer' |
  'manage_invitations' |
  'run_inference' |
  'tag_dataset_images' |
  'train_models' |
  'transfer_team_ownership' |
  'update_annotation_class' |
  'update_comment_thread' |
  'update_comment' |
  'update_dataset_data' |
  'update_dataset' |
  'update_membership' |
  'update_stage'|
  'update_team' |
  'view_annotation_classes' |
  'view_annotation_report' |
  'view_annotations' |
  'view_comment_threads' |
  'view_dataset_annotators' |
  'view_dataset_exports' |
  'view_dataset_performance_report' |
  'view_dataset_report' |
  'view_datasets' |
  'view_invitations' |
  'view_models' |
  'view_stage' |
  'view_team_members' |
  'view_team'

export type ApiKeyPermission = [AbilityID, 'all' | string]

export type ApiKeyPayload = {
  /* eslint-disable camelcase */
  id: number
  name: string
  permissions: ApiKeyPermission[]
  prefix: string
  team_id: number
  user_id: number
  /* eslint-enable camelcase */
}

export type ApiKeyState = {
  apiKeys: ApiKeyPayload[]
}

export type ApiKeyAction<T, R = any> = TypedAction<ApiKeyState, RootState, T, R>
export type ApiKeyMutation<R = any> = TypedMutation<ApiKeyState, R>
