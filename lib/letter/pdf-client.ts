'use client'

// Letter PDF generation — client-side via html2canvas + jsPDF.
// Mirrors the pattern used by CVPreview.buildPdfDoc().
//
// Usage:
//   const blob = await buildLetterPdfBlob(letterPreviewRef.current!)
//   // upload to /api/letter-pdf

export async function buildLetterPdfBlob(element: HTMLElement): Promise<Blob> {
  const html2canvas = (await import('html2canvas')).default
  const { jsPDF } = await import('jspdf')

  // Najdi vnitrni A4 surface (LetterPreview ma vnejsi wrapper + vnitrni 210mm div).
  // Bezpecnejsi pouzit predany element rovnou.
  const inner = element.firstElementChild as HTMLElement | null
  const origMinHeight = inner?.style.minHeight || ''
  if (inner) inner.style.minHeight = 'auto'

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    scrollY: 0,
    windowWidth: 794, // ~210mm at 96dpi
    backgroundColor: '#ffffff',
  })

  if (inner) inner.style.minHeight = origMinHeight

  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const pageW = 210
  const pageH = 297
  const ratio = canvas.width / canvas.height
  let w = pageW
  let h = pageW / ratio
  if (h > pageH) {
    h = pageH
    w = pageH * ratio
  }
  pdf.addImage(canvas.toDataURL('image/jpeg', 0.98), 'JPEG', (pageW - w) / 2, 0, w, h)
  return pdf.output('blob')
}
