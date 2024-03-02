export type TabSelectorOption = {
  /** What is shown in the tab tooltip, if anything */
  description?: string
  /** What is shown on the tab button. Will show value if label not specified */
  label?: string
  /** Value/identifier. What is emmited upon selection */
  value: string
}
