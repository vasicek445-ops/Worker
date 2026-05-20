import { DEJAVU_SANS_BASE64 } from './fonts/dejavu'

/**
 * Motivační dopis jako PDF — vyrenderuje AI text draftu do čistého A4 dopisu.
 * Přikládá se k přihlášce vedle CV.
 */
export async function buildMotivationPdf(params: {
  senderName: string
  body: string
  language?: string | null
}): Promise<string> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  // DejaVu Sans — Unicode font, umí české/slovenské znaky ve jménech (č, ř, ž…)
  doc.addFileToVFS('DejaVuSans.ttf', DEJAVU_SANS_BASE64)
  doc.addFont('DejaVuSans.ttf', 'DejaVuSans', 'normal')
  doc.setFont('DejaVuSans', 'normal')
  const marginX = 25
  const textW = 210 - marginX * 2
  let y = 32

  const locale =
    params.language === 'fr' ? 'fr-CH'
    : params.language === 'it' ? 'it-CH'
    : params.language === 'en' ? 'en-GB'
    : 'de-CH'

  doc.setFontSize(10)
  doc.setTextColor(110)
  doc.text(new Date().toLocaleDateString(locale), 210 - marginX, y, { align: 'right' })

  y += 18
  doc.setTextColor(20)
  doc.setFontSize(11)
  const lines = doc.splitTextToSize(params.body.trim(), textW) as string[]
  for (const line of lines) {
    if (y > 272) {
      doc.addPage()
      y = 32
    }
    doc.text(line, marginX, y)
    y += 6.2
  }

  y += 12
  if (y > 270) {
    doc.addPage()
    y = 32
  }
  doc.setFontSize(12)
  doc.text(params.senderName, marginX, y)

  return Buffer.from(doc.output('arraybuffer')).toString('base64')
}
