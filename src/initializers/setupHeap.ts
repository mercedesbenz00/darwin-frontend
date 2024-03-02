import { resolveVariable } from '@/utils/config'

const heapText = (): string | null => {
  const heapAppId = resolveVariable(process.env.VUE_APP_HEAP_APP_ID, '$HEAP_APP_ID')
  if (heapAppId === null) { return null }

  // eslint-disable-next-line max-len
  return `window.heap=window.heap||[],heap.load=function(e,t){window.heap.appid=e,window.heap.config=t=t||{};var r=document.createElement("script");r.type="text/javascript",r.async=!0,r.src="https://cdn.heapanalytics.com/js/heap-"+e+".js";var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(r,a);for(var n=function(e){return function(){heap.push([e].concat(Array.prototype.slice.call(arguments,0)))}},p=["addEventProperties","addUserProperties","clearEventProperties","identify","resetIdentity","removeEventProperty","setEventProperties","track","unsetEventProperty"],o=0;o<p.length;o++)heap[p[o]]=n(p[o])}
  heap.load(${heapAppId}, {
    disableTextCapture: true
  })`
}

export const setupHeap = (): void => {
  const heapScript = document.createElement('script')
  heapScript.setAttribute('type', 'text/javascript')
  heapScript.textContent = heapText()
  document.head.appendChild(heapScript)
}
