import LeaderLine from 'leader-line-new'

type UseLeaderLine = {
  addLeaderLine: (id: string, leaderLine: LeaderLine) => void
  removeLeaderLine: (id: string) => void
  clearLeaderLines: () => void
  leaderLineExists: (id: string) => boolean
  updateLeaderLine: (id: string) => void
  updateAllLeaderLines: () => void
}

class DOMInvalidError extends Error {
  constructor () {
    super('The Workflow creation container DOM is invalid')
  }
}

let leaderLines: Record<string, { leaderLine: LeaderLine, svg: SVGElement }> = {}

export const useLeaderLines = (): UseLeaderLine => {
  const clearLeaderLines = (): void => { 
    leaderLines = {}
  }

  const addLeaderLine = (id: string, leaderLine: LeaderLine): void => {
   
    const container = document.getElementById('layout-container')
    if (!container) { throw new DOMInvalidError() }
    
    const { top, left } = container.getBoundingClientRect()
    const svg = document.querySelector<SVGElement>('svg.leader-line:not([id])')
    if (!svg) { throw new DOMInvalidError() }
    
    svg.style.transform = `translate(-${left}px, -${top}px)`
    svg.setAttribute('id', `line-${id}`)
    container.appendChild(svg)

    leaderLine.position()
    leaderLines[id] = { leaderLine, svg }
  }

  const removeLeaderLine = (id: string): void => {
    const match = leaderLines[id]
    if (!match) { return }
    // the leaderline library expects the element to be a direct child of the
    // document body, so before removing it, we attach it there
    document.body.appendChild(match.svg)
    match.leaderLine.remove() 
    match.svg.remove()
    delete leaderLines[id]
  }

  const updateLeaderLine = (id: string): void => {
    const match = leaderLines[id]
    if (!match) { return }
    match.leaderLine.position()
  } 

  const updateAllLeaderLines = (): void => {
    Object.values(leaderLines).forEach((item) => { item.leaderLine.position() })
  }

  const leaderLineExists = (id: string): boolean =>  !!leaderLines[id]

  return {

    addLeaderLine,
    removeLeaderLine,
    clearLeaderLines,
    leaderLineExists,
    updateLeaderLine,
    updateAllLeaderLines
  }
}
