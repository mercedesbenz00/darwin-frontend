export type ButtonProps = {
  tag: ButtonTag | null,
  variant: ButtonVariant | null,
  color: ButtonColor | null,
  // style is a reserved word :(
  flair: ButtonFlair | null,
  size: CustomButtonSize | IconButtonSize | null
  fullWidth: boolean | null,
  disabled?: boolean
}

export enum ButtonVariant {
  DEFAULT = 'default',
  OUTLINE = 'outline'
}

export enum ButtonColor {
  TRANSPARENT = 'transparent',
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  POSITIVE = 'positive',
  NEGATIVE = 'negative',
  WARNING = 'warning',
  INFORMATIVE = 'informative',
  STAGE_ANNOTATION = 'stage-annotation',
  STAGE_CODE = 'stage-code',
  STAGE_COMPLETE = 'stage-complete',
  STAGE_DATASET = 'stage-dataset',
  STAGE_DISCARD = 'stage-discard',
  STAGE_LOGIC = 'stage-logic',
  STAGE_MODEL = 'stage-model',
  STAGE_NEW = 'stage-new',
  STAGE_REVIEW = 'stage-review',
}

// the icon button includes a mini
// version as it's only ment to hold
// a small icon as default slot
export enum IconButtonSize {
  MINI = 'mini',
  VERY_SMALL = 'very-small',
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
}

export enum CustomButtonSize {
  VERY_SMALL = 'very-small',
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
}

export enum ButtonFlair {
  SUPER_SOFT = 'super-soft',
  SOFT = 'soft',
  ROUNDED = 'rounded'
}

export enum ButtonTag {
  BUTTON = 'button',
  ROUTER = 'router-link',
  A = 'a',
  DIV = 'div',
}
