-- Tabulka pro kontakty na firmy (spusť v Supabase SQL Editor)
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  position TEXT,
  location TEXT,
  canton TEXT,
  salary_min INTEGER,
  salary_max INTEGER,
  currency TEXT DEFAULT 'CHF',
  email TEXT,
  phone TEXT,
  website TEXT,
  hr_contact_name TEXT,
  industry TEXT,
  description TEXT,
  requirements TEXT,
  language_required TEXT,
  contract_type TEXT DEFAULT 'permanent',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: jen platící uživatelé vidí kontaktní údaje
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Všichni vidí základní info (název, pozice, lokace)
CREATE POLICY "Anyone can view basic contact info"
  ON contacts FOR SELECT
  USING (true);

-- Index pro rychlé vyhledávání
CREATE INDEX idx_contacts_canton ON contacts(canton);
CREATE INDEX idx_contacts_industry ON contacts(industry);
CREATE INDEX idx_contacts_active ON contacts(is_active);

-- Vložíme ukázkové kontakty
INSERT INTO contacts (company_name, position, location, canton, salary_min, salary_max, email, phone, website, industry, language_required, description) VALUES
('Helvetia Bau AG', 'Stavbyvedoucí / Bauleiter', 'Zürich', 'ZH', 6000, 7500, 'hr@helvetiabau.ch', '+41 44 123 4567', 'https://helvetiabau.ch', 'Stavebnictví', 'B1 Němčina', 'Hledáme zkušeného stavbyvedoucího pro rezidenční projekty v Zürichu.'),
('Swiss Gastro Group', 'Kuchař / Koch', 'Bern', 'BE', 4500, 5500, 'jobs@swissgastro.ch', '+41 31 987 6543', 'https://swissgastro.ch', 'Gastronomie', 'A2 Němčina', 'Restaurace v centru Bernu hledá kuchaře s praxí v mezinárodní kuchyni.'),
('Alpine Care AG', 'Zdravotní sestra / Pflegefachfrau', 'Basel', 'BS', 6500, 8000, 'karriere@alpinecare.ch', '+41 61 555 1234', 'https://alpinecare.ch', 'Zdravotnictví', 'B1 Němčina', 'Nemocnice hledá zdravotní sestry/bratry pro oddělení interní medicíny.'),
('LogiSwiss Transport', 'Řidič kamiónu / LKW-Fahrer', 'Luzern', 'LU', 5200, 6200, 'fahrer@logiswiss.ch', '+41 41 333 7890', 'https://logiswiss.ch', 'Logistika', 'A2 Němčina', 'Mezinárodní přeprava, řidičák C/CE nutný.'),
('TechHub Zürich', 'Frontend Developer', 'Zürich', 'ZH', 8500, 11000, 'talent@techhub.ch', '+41 44 777 2345', 'https://techhub.ch', 'IT', 'B2 Angličtina', 'Startup hledá React/Next.js developera, remote-friendly.'),
('Reinigung Plus GmbH', 'Vedoucí úklidu / Reinigungsleiter', 'Winterthur', 'ZH', 4200, 5000, 'personal@reinigungplus.ch', '+41 52 444 5678', 'https://reinigungplus.ch', 'Služby', 'A2 Němčina', 'Vedení týmu 10 lidí, organizace směn.'),
('MountainView Hotel', 'Recepční / Rezeptionist', 'Interlaken', 'BE', 4500, 5200, 'jobs@mountainview.ch', '+41 33 888 1234', 'https://mountainview.ch', 'Hotelnictví', 'B1 Němčina + Angličtina', 'Luxusní hotel v Alpách hledá recepční na sezónu i celoročně.'),
('Precision Tools AG', 'CNC Operátor / CNC-Maschinist', 'Schaffhausen', 'SH', 5500, 6800, 'hr@precisiontools.ch', '+41 52 666 7890', 'https://precisiontools.ch', 'Výroba', 'A2 Němčina', 'Strojírenská firma, práce s CNC stroji Mazak a DMG Mori.'),
('CleanEnergy Swiss', 'Elektrikář / Elektriker', 'St. Gallen', 'SG', 5800, 7000, 'stellen@cleanenergy.ch', '+41 71 222 3456', 'https://cleanenergy.ch', 'Energetika', 'B1 Němčina', 'Instalace solárních panelů a elektroinstalace v novostavbách.'),
('Pharma Research Basel', 'Laborant / Laborant', 'Basel', 'BS', 6000, 7500, 'careers@pharmaresearch.ch', '+41 61 999 4567', 'https://pharmaresearch.ch', 'Farmaceutika', 'B2 Angličtina', 'Výzkumná laboratoř, práce s analytickými přístroji.');
