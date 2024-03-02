const copyWithElement = (text: string) => {
  const element = document.createElement('input')
  document.body.appendChild(element)
  element.value = text
  element.select()
  element.setSelectionRange(0, text.length)

  document.execCommand('copy')

  element.remove()
}

/**
 * Copies specified text to clipboard.
 *
 * If the navigator.clipboard api is available, it uses that.
 *
 * If not available, it uses a "hacky" approach where an input element is
 * temporarily attacthed to the document, it's value is set to the specified,
 * then the text is selected and copited using `document.execCommand('copy')`
 */
export const copy = (text: string): Promise<any> => {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text)
  }

  return Promise.resolve(copyWithElement(text))
}
