// Generuje PNG náhledy 15 CV šablon pro Woker builder.
//
// Vyžaduje: npm install -D playwright tsx && npx playwright install chromium
//
// Spuštění:
// 1. Spusť dev server: npm run dev (terminal #1)
// 2. Spusť script: npx tsx scripts/generate-thumbnails.ts (terminal #2)
// 3. PNG soubory budou v public/cv-thumbs/{templateId}.png (400x560)

import { chromium } from 'playwright'
import path from 'path'
import fs from 'fs'
import { TEMPLATES } from '../lib/cv/templates'

const BASE_URL = process.env.THUMB_BASE_URL || 'http://localhost:3000'
const OUT_DIR = path.resolve(__dirname, '../public/cv-thumbs')

async function main() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true })
  }

  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: { width: 400, height: 560 },
    deviceScaleFactor: 2, // retina-quality PNG
  })
  // Pre-seed localStorage — vypne cookie banner ještě před načtením stránky
  await context.addInitScript(() => {
    try { localStorage.setItem('woker_cookie_consent', 'accepted') } catch {}
  })
  const page = await context.newPage()

  let ok = 0
  let fail = 0

  for (const tpl of TEMPLATES) {
    const url = `${BASE_URL}/dev/cv-thumb?template=${tpl.id}&color=${encodeURIComponent(
      tpl.defaultColor,
    )}`
    const out = path.join(OUT_DIR, `${tpl.id}.png`)

    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
      await page.waitForTimeout(500)
      await page.screenshot({ path: out, fullPage: false })
      console.log(`OK  ${tpl.id.padEnd(20)} -> ${path.relative(process.cwd(), out)}`)
      ok++
    } catch (err) {
      console.error(`ERR ${tpl.id.padEnd(20)} ${(err as Error).message}`)
      fail++
    }
  }

  await browser.close()
  console.log(`\nDone. ${ok} ok, ${fail} failed. Output: ${path.relative(process.cwd(), OUT_DIR)}/`)
  if (fail > 0) process.exit(1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
