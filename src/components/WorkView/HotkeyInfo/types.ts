export type Hotkey = {
  description?: string
  /*
   * Define key combinations
   * string[]: ['CTRL', 'X'] => CTRL + X
   * string[]: [{ keys: ['+'] }, { keys: ['CTRL', 'X'] }] => + or CTRL + X
   */
  keys: string[] | Hotkey[]
  multi?: boolean
}

export type HotkeyString = {
  /*
   * Define key combinations
   * string[]: ['CTRL', 'X'] => CTRL + X
   * string[]: [{ keys: ['+'] }, { keys: ['CTRL', 'X'] }] => + or CTRL + X
   */
  keys: string[]
}

export type HotkeyCategory = {
  name: string
  hotkeys: Hotkey[]
}
