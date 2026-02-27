#!/bin/bash
# Import SwissStaffing agencies into Supabase
set -e
echo "📦 Setting up agencies import..."

# 1. Create SQL migration for Supabase (run this in Supabase SQL Editor)
cat > supabase-agencies-table.sql << 'SQLEND'
-- Create agencies table
CREATE TABLE IF NOT EXISTS agencies (
  id SERIAL PRIMARY KEY,
  swissstaffing_id TEXT UNIQUE,
  company TEXT NOT NULL,
  street TEXT,
  zip TEXT,
  city TEXT,
  canton TEXT,
  region TEXT, -- german, french, italian
  telephone TEXT,
  email TEXT,
  website TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  source TEXT DEFAULT 'swissstaffing',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for fast search
CREATE INDEX IF NOT EXISTS idx_agencies_city ON agencies(city);
CREATE INDEX IF NOT EXISTS idx_agencies_canton ON agencies(canton);
CREATE INDEX IF NOT EXISTS idx_agencies_region ON agencies(region);
CREATE INDEX IF NOT EXISTS idx_agencies_company ON agencies(company);
CREATE INDEX IF NOT EXISTS idx_agencies_zip ON agencies(zip);

-- Enable full text search
ALTER TABLE agencies ADD COLUMN IF NOT EXISTS fts tsvector 
  GENERATED ALWAYS AS (to_tsvector('simple', coalesce(company, '') || ' ' || coalesce(city, '') || ' ' || coalesce(canton, ''))) STORED;
CREATE INDEX IF NOT EXISTS idx_agencies_fts ON agencies USING gin(fts);

-- Enable RLS
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read agencies
CREATE POLICY "Authenticated users can read agencies" ON agencies
  FOR SELECT TO authenticated USING (true);

-- Allow anon to read (for public listing if needed)  
CREATE POLICY "Public can read agencies" ON agencies
  FOR SELECT TO anon USING (true);
SQLEND

# 2. Create Node.js import script
cat > import-agencies.mjs << 'IMPORTEND'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// Load env from .env.local
import { config } from 'dotenv'
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  console.error('Add SUPABASE_SERVICE_ROLE_KEY from Supabase Dashboard > Settings > API > service_role key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Swiss PLZ to Canton mapping
function getCantonFromZip(zip) {
  const z = parseInt(zip)
  if (z >= 1000 && z <= 1299) return 'VD'
  if (z >= 1300 && z <= 1399) return 'VD'
  if (z >= 1400 && z <= 1499) return 'VD'
  if (z >= 1500 && z <= 1599) return 'FR'
  if (z >= 1600 && z <= 1699) return 'FR'
  if (z >= 1700 && z <= 1799) return 'FR'
  if (z >= 1800 && z <= 1899) return 'VD'
  if (z >= 1900 && z <= 1999) return 'VS'
  if (z >= 1200 && z <= 1299) return 'GE'
  if (z >= 2000 && z <= 2099) return 'NE'
  if (z >= 2100 && z <= 2199) return 'NE'
  if (z >= 2200 && z <= 2299) return 'NE'
  if (z >= 2300 && z <= 2399) return 'BE'
  if (z >= 2400 && z <= 2499) return 'BE'
  if (z >= 2500 && z <= 2599) return 'BE'
  if (z >= 2600 && z <= 2699) return 'BE'
  if (z >= 2700 && z <= 2799) return 'JU'
  if (z >= 2800 && z <= 2999) return 'JU'
  if (z >= 3000 && z <= 3199) return 'BE'
  if (z >= 3200 && z <= 3299) return 'FR'
  if (z >= 3300 && z <= 3399) return 'BE'
  if (z >= 3400 && z <= 3499) return 'BE'
  if (z >= 3500 && z <= 3599) return 'BE'
  if (z >= 3600 && z <= 3699) return 'BE'
  if (z >= 3700 && z <= 3799) return 'BE'
  if (z >= 3800 && z <= 3899) return 'BE'
  if (z >= 3900 && z <= 3999) return 'VS'
  if (z >= 4000 && z <= 4099) return 'BS'
  if (z >= 4100 && z <= 4199) return 'BL'
  if (z >= 4200 && z <= 4299) return 'BL'
  if (z >= 4300 && z <= 4399) return 'SO'
  if (z >= 4400 && z <= 4499) return 'SO'
  if (z >= 4500 && z <= 4599) return 'SO'
  if (z >= 4600 && z <= 4699) return 'SO'
  if (z >= 4700 && z <= 4799) return 'SO'
  if (z >= 4800 && z <= 4899) return 'AG'
  if (z >= 4900 && z <= 4999) return 'BE'
  if (z >= 5000 && z <= 5099) return 'AG'
  if (z >= 5100 && z <= 5199) return 'AG'
  if (z >= 5200 && z <= 5299) return 'AG'
  if (z >= 5300 && z <= 5399) return 'AG'
  if (z >= 5400 && z <= 5499) return 'AG'
  if (z >= 5500 && z <= 5599) return 'AG'
  if (z >= 5600 && z <= 5699) return 'AG'
  if (z >= 5700 && z <= 5799) return 'AG'
  if (z >= 5800 && z <= 5899) return 'AG'
  if (z >= 5900 && z <= 5999) return 'AG'
  if (z >= 6000 && z <= 6099) return 'LU'
  if (z >= 6100 && z <= 6199) return 'LU'
  if (z >= 6200 && z <= 6299) return 'LU'
  if (z >= 6300 && z <= 6399) return 'ZG'
  if (z >= 6400 && z <= 6499) return 'SZ'
  if (z >= 6500 && z <= 6599) return 'TI'
  if (z >= 6600 && z <= 6699) return 'TI'
  if (z >= 6700 && z <= 6799) return 'TI'
  if (z >= 6800 && z <= 6899) return 'TI'
  if (z >= 6900 && z <= 6999) return 'TI'
  if (z >= 7000 && z <= 7099) return 'GR'
  if (z >= 7100 && z <= 7199) return 'GR'
  if (z >= 7200 && z <= 7299) return 'GR'
  if (z >= 7300 && z <= 7399) return 'GR'
  if (z >= 7400 && z <= 7499) return 'GR'
  if (z >= 7500 && z <= 7599) return 'GR'
  if (z >= 7600 && z <= 7699) return 'GR'
  if (z >= 8000 && z <= 8099) return 'ZH'
  if (z >= 8100 && z <= 8199) return 'ZH'
  if (z >= 8200 && z <= 8299) return 'ZH'
  if (z >= 8300 && z <= 8399) return 'ZH'
  if (z >= 8400 && z <= 8499) return 'ZH'
  if (z >= 8500 && z <= 8599) return 'TG'
  if (z >= 8600 && z <= 8699) return 'ZH'
  if (z >= 8700 && z <= 8799) return 'ZH'
  if (z >= 8800 && z <= 8899) return 'SZ'
  if (z >= 8900 && z <= 8999) return 'AG'
  if (z >= 9000 && z <= 9099) return 'SG'
  if (z >= 9100 && z <= 9199) return 'AI'
  if (z >= 9200 && z <= 9299) return 'SG'
  if (z >= 9300 && z <= 9399) return 'SG'
  if (z >= 9400 && z <= 9499) return 'SG'
  if (z >= 9500 && z <= 9599) return 'SG'
  if (z >= 9600 && z <= 9699) return 'SG'
  if (z >= 9700 && z <= 9799) return 'SG'
  if (z >= 9800 && z <= 9899) return 'SG'
  return 'ZH' // fallback
}

function getRegionFromCanton(canton) {
  const french = ['VD', 'GE', 'NE', 'JU', 'FR', 'VS']
  const italian = ['TI']
  if (french.includes(canton)) return 'french'
  if (italian.includes(canton)) return 'italian'
  return 'german'
}

async function importAgencies() {
  console.log('📖 Reading swissstaffing-agencies.json...')
  
  let agencies
  try {
    const raw = readFileSync('swissstaffing-agencies.json', 'utf8')
    agencies = JSON.parse(raw)
  } catch (e) {
    console.error('❌ Could not read swissstaffing-agencies.json')
    console.error('Make sure the file is in the project root (downloaded from Chrome)')
    process.exit(1)
  }
  
  console.log(`📊 Found ${agencies.length} agencies`)
  
  // Map to DB format
  const rows = agencies.map(a => {
    const canton = getCantonFromZip(a.zip)
    return {
      swissstaffing_id: a.id,
      company: a.company.trim(),
      street: a.street?.trim() || null,
      zip: a.zip || null,
      city: a.city || null,
      canton,
      region: getRegionFromCanton(canton),
      telephone: a.telephone || null,
      email: a.email || null,
      website: a.website || null,
      latitude: a.latitude ? parseFloat(a.latitude) : null,
      longitude: a.longitude ? parseFloat(a.longitude) : null,
      source: 'swissstaffing'
    }
  })
  
  // Insert in batches of 100
  const batchSize = 100
  let inserted = 0
  let errors = 0
  
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize)
    const { error } = await supabase.from('agencies').upsert(batch, { 
      onConflict: 'swissstaffing_id' 
    })
    
    if (error) {
      console.error(`❌ Batch ${i}-${i + batch.length}: ${error.message}`)
      errors++
    } else {
      inserted += batch.length
      console.log(`✅ ${inserted}/${rows.length} imported...`)
    }
  }
  
  console.log('')
  console.log('═══════════════════════════════')
  console.log(`✅ Import complete!`)
  console.log(`📊 Total: ${rows.length} agencies`)
  console.log(`✅ Inserted: ${inserted}`)
  console.log(`❌ Errors: ${errors}`)
  console.log('═══════════════════════════════')
  
  // Print stats
  const regions = rows.reduce((acc, r) => { acc[r.region] = (acc[r.region] || 0) + 1; return acc }, {})
  console.log(`\n🇩🇪 German: ${regions.german || 0}`)
  console.log(`🇫🇷 French: ${regions.french || 0}`)
  console.log(`🇮🇹 Italian: ${regions.italian || 0}`)
}

importAgencies().catch(console.error)
IMPORTEND

# 3. Install dotenv if not already there
echo "📦 Installing dotenv..."
npm install dotenv --save-dev 2>/dev/null || true

echo ""
echo "✅ Import setup complete!"
echo ""
echo "═══════════════════════════════"
echo "KROKY:"
echo "═══════════════════════════════"
echo ""
echo "1️⃣  Zkopíruj soubor 'swissstaffing-agencies.json' z Downloads do složky woker/"
echo "    cp ~/Downloads/swissstaffing-agencies.json ."
echo ""
echo "2️⃣  Otevři Supabase SQL Editor a spusť obsah souboru 'supabase-agencies-table.sql'"
echo "    (vytvoří tabulku agencies s indexy)"
echo ""
echo "3️⃣  Přidej SUPABASE_SERVICE_ROLE_KEY do .env.local"
echo "    (najdeš v Supabase > Settings > API > service_role key)"
echo ""
echo "4️⃣  Spusť import:"
echo "    node import-agencies.mjs"
echo ""
echo "═══════════════════════════════"
