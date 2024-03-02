/**
 * Measures the text width from the font size and text content
 */
export class TextMeasurer {
  canvas: HTMLCanvasElement | undefined;

  initCanvas () {
    if (!this.canvas) {
      this.canvas = document.createElement('canvas')
    }
  }

  calculateWidth (text: string, font: string): number {
    this.initCanvas()

    const context = this.canvas!.getContext('2d')
    if (!context) { return 0 }
    context.font = font

    const metrices = context.measureText(text)
    return metrices.width
  }

  getFitTextLines (text: string, lines: number, fitWidth: number, font: string): Array<string> {
    if (!text || lines === 0 || fitWidth === 0) { return [] }

    // Get rough character count to fit to fitWidth
    const roughChars: number = Math.floor(fitWidth / this.calculateWidth('Q', font))
    // This will keep the lines of the text
    const textLines: Array<string> = []
    let addedLength = 0

    do {
      let chars = roughChars
      // Adjust text for the line to fit to fitWidth
      while (1) {
        const len0 = this.calculateWidth(text.slice(addedLength, addedLength + chars), font)
        const len1 = this.calculateWidth(text.slice(addedLength, addedLength + chars + 1), font)
        if (len0 <= fitWidth && len1 > fitWidth) {
          break
        } else if (len0 <= fitWidth && len1 <= fitWidth) {
          chars++
          if ((addedLength + chars) >= text.length) { break }
        } else if (len0 > fitWidth && len1 > fitWidth) { chars-- }
      }

      const textLine = text.slice(addedLength, addedLength + chars)
      textLines.push(textLine)
      addedLength += textLine.length
    } while (addedLength < text.length && textLines.length < lines)

    // In case of overflow, add ellipsis to the last line
    if (text.length > addedLength) {
      textLines[textLines.length - 1] = textLines[textLines.length - 1].slice(0, -1) + '...'
    }

    return textLines
  }
}
