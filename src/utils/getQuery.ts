export function getQuery (query: string): HTMLDivElement | null {
  return document.querySelector<HTMLDivElement>(query)
}
