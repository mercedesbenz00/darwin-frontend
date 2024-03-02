export enum TextSize {
  XS = 'xs',
  SM = 'sm',
  MD = 'md',
  MD1 = 'md-1',
  MD2 = 'md-2',
  LG = 'lg',
  LG1 = 'lg-1',
  XL = 'xl',
  XL1 = 'xl-1',
  XL2 = 'xl-2',
  XXL = 'xxl',
  XXL1 = 'xxl-1',
  XXL2 = 'xxl-2',
  XXL3 = 'xxl-3',
  XXL4 = 'xxl-4',
}

export type TextContentLoaderProps = {
  variant: TextSize
  width: number | null
}
