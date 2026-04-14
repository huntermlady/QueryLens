import { toPng } from 'html-to-image'

export async function exportPng(element: HTMLElement, filename = 'querylens-chart.png') {
  const dataUrl = await toPng(element, {
    cacheBust: true,
    backgroundColor: document.documentElement.classList.contains('dark') ? '#09090b' : '#ffffff',
    pixelRatio: 2,
  })
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  a.click()
}
