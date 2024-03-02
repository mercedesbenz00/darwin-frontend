export enum ActionBarType {
  DEFAULT = 'default',
  SELECT = 'select',
  DANGER = 'danger'
}

export type ActionBarElement = {
  active?: boolean
  disabled?: string
}

export enum DangerMode {
  ARCHIVE = 'archive',
  DELETE = 'delete'
}
