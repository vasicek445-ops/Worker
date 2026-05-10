// Generate 6 card illustrations via Recraft V4 API
// Run: node scripts/gen-card-illustrations.mjs

import fs from 'node:fs/promises';
import path from 'node:path';

const KEY = process.env.RECRAFT_API_KEY;
if (!KEY) {
  console.error('Missing RECRAFT_API_KEY in env');
  process.exit(1);
}

const OUTDIR = path.resolve('public/illustrations/cards');
await fs.mkdir(OUTDIR, { recursive: true });

const STYLE_PREAMBLE =
  'orange and white color palette, isometric perspective, soft flat shadows, minimal white background, single floating object centered, bold and confident design, modern 3D rendered icon';

const cards = [
  ['01-outreach', 'paper airplane flying upward with motion trail'],
  ['02-prace', 'leather briefcase with documents inside'],
  ['03-bydleni', 'small apartment building with windows and a key floating beside it'],
  ['04-cv', 'professional CV resume document with a green checkmark seal'],
  ['05-pohovor', 'vintage microphone with a speech bubble next to it'],
  ['06-asistent', 'stack of stamped official documents with a paper clip'],
];

async function genOne(name, subject) {
  const prompt = `${subject}, ${STYLE_PREAMBLE}`;
  const r = await fetch('https://external.api.recraft.ai/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt, model: 'recraftv4', size: '1024x1024' }),
  });
  const data = await r.json();
  if (!r.ok || !data?.data?.[0]?.url) {
    console.error(`✗ ${name} FAILED:`, JSON.stringify(data));
    return false;
  }
  const url = data.data[0].url;
  const imgRes = await fetch(url);
  const buf = Buffer.from(await imgRes.arrayBuffer());
  const out = path.join(OUTDIR, `${name}.png`);
  await fs.writeFile(out, buf);
  console.log(`✓ ${name}.png  (${(buf.length / 1024).toFixed(0)} KB, ${data.credits || '?'} credits)`);
  return true;
}

console.log(`Generating ${cards.length} illustrations to ${OUTDIR}...\n`);

const results = await Promise.all(cards.map(([n, s]) => genOne(n, s)));
const ok = results.filter(Boolean).length;

console.log(`\n${ok}/${cards.length} done`);
if (ok < cards.length) process.exit(1);
