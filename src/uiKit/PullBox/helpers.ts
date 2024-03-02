/**
 * Returns scrollable child HTML element or null
 * @param {Element} node
 * @returns {(Element|null)}
 */
export const getScrollChild = (node: Element): Element | null | undefined => {
  if (!node) {
    return null
  }

  // Defines is node scrollable
  if (node.scrollHeight > node.clientHeight) {
    return node
  }

  for (let i = 0; i < node.children.length; i++) {
    const res = getScrollChild(node.children[i])
    if (res) { return res }
  }
}
