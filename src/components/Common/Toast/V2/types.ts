export enum ToastEvent {
  DEFAULT = 'default',
  ERROR = 'error',
  WARNING = 'warning',
  SUCCESS = 'success',
}

export type ToastProps = {
  variant: ToastEvent
  meta: {
    title: string
    desc?: string
  }
}
