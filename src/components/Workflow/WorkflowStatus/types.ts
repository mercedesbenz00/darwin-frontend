export enum WorkflowStatusVariant {
  ACTIVE = 'active',
  RUNNING = 'running',
  DRAFT = 'draft',
  OFFLINE = 'offline',
  INACTIVE = 'inactive'
}

export interface WorkflowStatusProps extends HTMLButtonElement {
  variant?: WorkflowStatusVariant
  dense?: boolean
}
