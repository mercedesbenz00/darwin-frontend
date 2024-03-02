/**
 * Shape of the tooltip rendered using v-tooltip
 *
 * It can be a simple string, or an object containing the content and additional
 * options.
 */
export type TooltipOptions = {
  content: string
  delay?: { show?: number, hide?: number } | number,
  classes?: boolean | string | string[],
  placement?: 'top' | 'right' | 'bottom' | 'left',
  offset?: number
  show?: boolean
  trigger?: string
} | string
