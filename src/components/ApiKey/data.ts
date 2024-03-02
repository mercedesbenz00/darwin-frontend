import { AbilityID } from '@/store/modules/apiKey/types'

import { AbilityGroup, Group } from './types'

/**
 * Defines groups to group user permissions by
 *
 * Definition order determines render order
 */
const PERMISSION_GROUPS: Group[] = [
  { name: 'Manage Team', id: 'manage_team' },
  { name: 'Manage Datasets', id: 'manage_datasets' },
  { name: 'Manage Tasks', id: 'manage_tasks' },
  { name: 'Manage Comments', id: 'manage_comments' },
  { name: 'Manage Team Members', id: 'manage_team_members' },
  { name: 'Manage Models', id: 'manage_models' }
]

/**
 * Defines to which group each ability/permission belongs to.
 *
 * If an ability is not listed in a group, it wont be rendered on the frontend.
 *
 * This means it's a backend-only ability and it's API key use is not supported.
 */
const GROUPED_ABILITIES: { [k in AbilityGroup]: AbilityID[] } = {
  manage_tasks: [
    'assign_items',
    'view_stage',
    'update_stage'

  ],
  manage_datasets: [
    'view_datasets',
    'export_dataset',
    'create_dataset',
    'fork_dataset',
    'update_dataset',
    'archive_dataset',
    'update_dataset_data',
    'archive_dataset_items',
    'delete_dataset_items',
    'view_annotations',
    'view_annotation_report',
    'view_dataset_annotators',
    'view_dataset_exports',
    'view_dataset_performance_report',
    'view_dataset_report',
    'view_annotation_classes',
    'create_annotation_class',
    'update_annotation_class',
    'delete_annotation_class',
    'import_annotations'
  ],
  manage_team: [
    'archive_team',
    'create_team',
    'transfer_team_ownership',
    'manage_customer',
    'update_team',
    'view_team'
  ],
  manage_team_members: [
    'delete_membership',
    'manage_admin_invitations',
    'manage_invitations',
    'update_membership',
    'view_invitations',
    'view_team_members'
  ],
  manage_comments: [
    'create_comment_thread',
    'create_comment',
    'delete_comment_thread',
    'delete_comment',
    'update_comment_thread',
    'update_comment',
    'view_comment_threads'
  ],
  manage_models: [
    'deploy_model',
    'train_models',
    'view_models',
    'run_inference'
  ]
}

/**
 * Lists detailed information about abilities, for friendlier rendering.
 *
 * - `name` is shown as the primary way to depict an ability.
 * - `info` is extended explanation of an ability, usually rendered on hover
 */
const ABILITY_INFO: {[k in AbilityID]: { name: string, info: string }} = {
  /* eslint-disable max-len */
  archive_dataset_items: { name: 'Archive and restore items', info: 'Archive and restore items in a dataset.' },
  archive_dataset: { name: 'Archive datasets', info: 'Archive the entire dataset.' },
  archive_team: { name: 'Archive team', info: 'Archive the entire team.' },
  assign_items: { name: 'Assign items', info: 'Assign items as workflows to annotators.' },
  create_annotation_class: { name: 'Create annotation classes', info: 'Create new annotation classes.' },
  create_comment_thread: { name: 'Start new comment threads.', info: 'Start new comment threads on an image, during annotation or review.' },
  create_comment: { name: 'Reply to comment threads', info: 'Post replies to existing comment threads.' },
  create_dataset: { name: 'Create datasets', info: 'Create new datasets.' },
  create_team: { name: 'Create teams', info: 'Create new teams.' },
  delete_annotation_class: { name: 'Delete annotation classes', info: 'Delete existing annotation classes.' },
  delete_comment_thread: { name: 'Delete comment threads', info: 'Delete existing comment threads, during annotation or review.' },
  delete_comment: { name: 'Delete comments', info: 'Delete comments in existing comment threads.' },
  delete_dataset_items: { name: 'Delete dataset items', info: 'Permanently delete dataset items.' },
  delete_membership: { name: 'Delete memberships', info: 'Permanently remove users from the team.' },
  deploy_model: { name: 'Deploy existing neural models', info: 'Deploy existing neural models.' },
  export_dataset: { name: 'Export datasets', info: 'Export annotation data from datasets.' },
  fork_dataset: { name: 'Fork datasets', info: 'Fork existing datasets to create new ones.' },
  import_annotations: { name: 'Import annotations', info: 'Import annotations from external sources' },
  manage_admin_invitations: { name: 'Create admin invites', info: 'Invite users to become team administrators.' },
  manage_customer: { name: 'View and update billing information', info: 'View and update your billing information.' },
  manage_invitations: { name: 'Create invites', info: 'Invite users to become team members or annotators.' },
  run_inference: { name: 'Run model inference', info: 'Use special tools based on deployed models to annotate images.' },
  tag_dataset_images: { name: 'Tag dataset images', info: 'Tag entire images with classes.' },
  train_models: { name: 'Train new neural models', info: 'Train new neural models.' },
  transfer_team_ownership: { name: 'Transfer team ownership', info: 'Transfer ownership of this team to another user.' },
  update_annotation_class: { name: 'Update annotation classes', info: 'Update existing annotation classes.' },
  update_comment_thread: { name: 'Edit comment threads', info: 'Edit content of comment threads.' },
  update_comment: { name: 'Edit comments', info: 'Edit content of comments.' },
  update_dataset_data: { name: 'Add data to datasets', info: 'Add images, videos or any other supported data to datasets.' },
  update_dataset: { name: 'Update datasets', info: 'Edit dataset information.' },
  update_membership: { name: 'Update team members', info: 'Change a team members role.' },
  update_stage: { name: 'Update item workflow', info: 'Progress item through workflow stages' },
  update_team: { name: 'Update team', info: 'Change team information.' },
  view_annotation_classes: { name: 'View annotation classes', info: 'View annotation classes defined for a dataset.' },
  view_annotation_report: { name: 'View annotation reports', info: 'View or download annotation reports.' },
  view_annotations: { name: 'View annotations', info: 'View annotation data for an image.' },
  view_comment_threads: { name: 'View comment threads', info: 'Read comment threads created for an image.' },
  view_dataset_annotators: { name: 'View dataset annotators', info: 'View users marked as annotators for a specific dataset.' },
  view_dataset_exports: { name: 'View exported datasets', info: 'List exported dataset versions for downloading.' },
  view_dataset_performance_report: { name: 'View dataset performance reports', info: 'View performance reports for a dataset.' },
  view_dataset_report: { name: 'View dataset reports', info: 'View statistical reports for a dataset.' },
  view_datasets: { name: 'View datasets', info: 'View dataset information.' },
  view_invitations: { name: 'View invitations', info: 'View team invitations.' },
  view_models: { name: 'View neural models', info: 'View information on team neural models.' },
  view_stage: { name: 'View workflow stages', info: "View information about an item's workflow stages." },
  view_team_members: { name: 'View team members', info: 'View all team members.' },
  view_team: { name: 'View team', info: 'View team information.' }
  /* eslint-enable max-len */
}

export { ABILITY_INFO, GROUPED_ABILITIES, PERMISSION_GROUPS }
