export enum StatusOptions {
  ACTIVE = 'active',
  RUNNING = 'running',
  DRAFT = 'draft',
  OFFLINE = 'offline',
  INACTIVE = 'inactive'
}

export interface StatusProps extends HTMLElement {
  value: StatusOptions,
  outline: boolean,
}
