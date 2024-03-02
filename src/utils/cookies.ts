/**
 * Return cookie value by its name
 */
export const getCookie = (name: string): string | undefined => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  if (match) { return match[2] }
}

/**
 * Set cookie name and value.
 * if days is not specified, then it will be session cookie
 */
export const setCookie = (name: string, value: string, days: number = 0): void => {
  let expires = ''
  if (days) {
    const date = new Date()
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000))
    expires = '; expires=' + date.toUTCString()
  }
  document.cookie = name + '=' + (value || '') + expires + '; path=/'
}

/**
 * Delete cookie by its name
 */
export const deleteCookie = (name: string): void => {
  document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
}
