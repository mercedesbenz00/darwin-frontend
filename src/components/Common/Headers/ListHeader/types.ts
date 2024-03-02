export enum ListHeaderVariant {
  ELEVATE = 'elevate',
  TRANSPARENT = 'transparent '
}

export enum ListHeaderSize {
  SM = 'small',
  MD = 'medium',
  LG = 'large'
}

export type ListHeader = {
  size: ListHeaderSize | null
  variant: ListHeaderVariant | null
  label: string | null
}
