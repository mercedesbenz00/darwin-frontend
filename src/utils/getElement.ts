export function getElement (id: string, parent?: boolean): HTMLDivElement | null {
  const el = document.getElementById(id) as HTMLDivElement | null
  return parent ? el?.parentElement as HTMLDivElement | null : el
}
