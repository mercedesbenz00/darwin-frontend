export const loadBoolean = (key: string, fallback: boolean) => {
  const setting = window.localStorage.getItem(key)
  if (setting === 'true') { return true }
  if (setting === 'false') { return false }
  return fallback
}

export const saveBoolean = (key: string, value: boolean) =>
  window.localStorage.setItem(key, `${value}`)

export const loadNumber = (key: string, fallback: number) => {
  const setting = window.localStorage.getItem(key)
  if (!setting) { return fallback }

  const value = parseInt(setting, 10)
  if (isNaN(value)) { return fallback }

  return value
}

export const saveNumber = (key: string, value: number) =>
  window.localStorage.setItem(key, `${value}`)
