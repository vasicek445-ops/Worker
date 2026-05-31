-- Long-term housing cooperatives from Wohnungssuche outreach
-- Source: Resend emails 2026-05-01 to 2026-05-05 (Monatliche Miete + Langzeit-Unterkunft)
-- Filter: .ch + housing co-op signal + NOT senior care/Pflege/student
-- Total entries: 37

INSERT INTO housing (
  title, agency_name, agency_contact, canton, source,
  is_temporary, posted_at
) VALUES
  ('Wohnbaugenossenschaft von Arbeitgebern von Thun und Umgebung', 'Wohnbaugenossenschaft von Arbeitgebern von Thun und Umgebung', 'bewirtschaftung@casa-thun.ch', NULL, 'wohnbau_coop', FALSE, '2026-05-01'::timestamptz),
  ('Wohnbaugenossenschaft Region Kreuzlingen', 'Wohnbaugenossenschaft Region Kreuzlingen', 'c.huber@webege.ch', NULL, 'wohnbau_coop', FALSE, '2026-05-01'::timestamptz),
  ('Wohnbaugenossenschaft ''Zielacker''', 'Wohnbaugenossenschaft ''Zielacker''', 'claudia.specht@marthaler-immobilien.ch', NULL, 'wohnbau_coop', FALSE, '2026-05-01'::timestamptz),
  ('Wohnbaugenossenschaft Schlüssel am Ährenweg', 'Wohnbaugenossenschaft Schlüssel am Ährenweg', 'geno.aehrenweg@immerda.ch', NULL, 'wohnbau_coop', FALSE, '2026-05-01'::timestamptz),
  ('Allgemeine Baugenossenschaft Zürich (ABZ)', 'Allgemeine Baugenossenschaft Zürich (ABZ)', 'info@abz.ch', NULL, 'wohnbau_coop', FALSE, '2026-05-05'::timestamptz),
  ('Gemeinnützige Baugenossenschaft Cham GBC', 'Gemeinnützige Baugenossenschaft Cham GBC', 'info@gbc-cham.ch', NULL, 'wohnbau_coop', FALSE, '2026-05-01'::timestamptz),
  ('Wohnbaugenossenschaft Gesundes Wohnen MCS', 'Wohnbaugenossenschaft Gesundes Wohnen MCS', 'info@gesundes-wohnen-mcs.ch', NULL, 'wohnbau_coop', FALSE, '2026-05-01'::timestamptz),
  ('Gemeinnützige Gesellschaft der Stadt Luzern', 'Gemeinnützige Gesellschaft der Stadt Luzern', 'info@ggl-luzern.ch', NULL, 'wohnbau_coop', FALSE, '2026-05-02'::timestamptz),
  ('Wohnbaugenossenschaft Lärchenhügel', 'Wohnbaugenossenschaft Lärchenhügel', 'info@laerchenhuegel.ch', NULL, 'wohnbau_coop', FALSE, '2026-05-01'::timestamptz),
  ('Wohnbaugenossenschaft LANZGUT', 'Wohnbaugenossenschaft LANZGUT', 'info@lanzgut.ch', NULL, 'wohnbau_coop', FALSE, '2026-05-01'::timestamptz),
  ('LeWiNa', 'LeWiNa', 'info@lewina.ch', NULL, 'wohnbau_coop', FALSE, '2026-05-01'::timestamptz),
  ('Wohnbaugenossenschaft LYSE-LOTTE', 'Wohnbaugenossenschaft LYSE-LOTTE', 'info@lyse-lotte.ch', NULL, 'wohnbau_coop', FALSE, '2026-05-01'::timestamptz),
  ('Wohnbaugenossenschaft Pro Familia Schaffhausen', 'Wohnbaugenossenschaft Pro Familia Schaffhausen', 'info@pro-familia.ch', NULL, 'wohnbau_coop', FALSE, '2026-05-01'::timestamptz),
  ('Genossenschaft Sunnezirkel Rickenbach', 'Genossenschaft Sunnezirkel Rickenbach', 'info@sunnezirkel.ch', NULL, 'wohnbau_coop', FALSE, '2026-05-01'::timestamptz),
  ('Wohnbaugenossenschaft Türmliwiese', 'Wohnbaugenossenschaft Türmliwiese', 'info@tuermliwiese.ch', NULL, 'wohnbau_coop', FALSE, '2026-05-01'::timestamptz),
  ('Wohnbaugenossenschaft Warmbächli', 'Wohnbaugenossenschaft Warmbächli', 'info@warmbaechli.ch', NULL, 'wohnbau_coop', FALSE, '2026-05-01'::timestamptz),
  ('Wohngenossenschaft Birsfelden', 'Wohngenossenschaft Birsfelden', 'info@wg-birsfelden.ch', NULL, 'wohnbau_coop', FALSE, '2026-05-01'::timestamptz),
  ('Wohngenossenschaft Albanrheinweg', 'Wohngenossenschaft Albanrheinweg', 'info@wga.ch', NULL, 'wohnbau_coop', FALSE, '2026-05-01'::timestamptz),
  ('Wohngenossenschaft am Rain', 'Wohngenossenschaft am Rain', 'info@wgamrain.ch', NULL, 'wohnbau_coop', FALSE, '2026-05-01'::timestamptz),
  ('Wohngenossenschaft an der Birs', 'Wohngenossenschaft an der Birs', 'info@wganderbirs.ch', NULL, 'wohnbau_coop', FALSE, '2026-05-01'::timestamptz),
  ('Wohngenossenschaft Drei Linden', 'Wohngenossenschaft Drei Linden', 'info@wgdreilinden.ch', NULL, 'wohnbau_coop', FALSE, '2026-05-01'::timestamptz),
  ('Genossenschaft WIA Lenzburg', 'Genossenschaft WIA Lenzburg', 'info@wialenzburg.ch', NULL, 'wohnbau_coop', FALSE, '2026-05-01'::timestamptz),
  ('Wohngenossenschaft Dach', 'Wohngenossenschaft Dach', 'info@wogenodach.ch', NULL, 'wohnbau_coop', FALSE, '2026-05-01'::timestamptz),
  ('Wohnbaustiftung Baden', 'Wohnbaustiftung Baden', 'info@wohnbaustiftung-baden.ch', NULL, 'wohnbau_coop', FALSE, '2026-05-01'::timestamptz),
  ('Wohnbaugenossenschaft Wohnen im Stöckli', 'Wohnbaugenossenschaft Wohnen im Stöckli', 'info@wohnen-im-stoeckli.ch', NULL, 'wohnbau_coop', FALSE, '2026-05-01'::timestamptz),
  ('Wohnbaugenossenschaft Thurgi-Hof', 'Wohnbaugenossenschaft Thurgi-Hof', 'info@zimba.ch', NULL, 'wohnbau_coop', FALSE, '2026-05-01'::timestamptz),
  ('Wohnbaugenossenschaft Zuhause am Bielersee', 'Wohnbaugenossenschaft Zuhause am Bielersee', 'info@zuhauseambielersee.ch', NULL, 'wohnbau_coop', FALSE, '2026-05-01'::timestamptz),
  ('Wohnheim Dynamo', 'Wohnheim Dynamo', 'kontakt@wohnheimdynamo.ch', NULL, 'wohnbau_coop', FALSE, '2026-05-05'::timestamptz),
  ('GenerationenWohnen Thunstrasse Burgdorf', 'GenerationenWohnen Thunstrasse Burgdorf', 'mail@generationenwohnen.ch', NULL, 'wohnbau_coop', FALSE, '2026-05-02'::timestamptz),
  ('Gemeinnützige Bau- u. Wohngenossenschaft FREISTATT', 'Gemeinnützige Bau- u. Wohngenossenschaft FREISTATT', 'mirjam.loosli@freistatt.ch', NULL, 'wohnbau_coop', FALSE, '2026-05-01'::timestamptz),
  ('Wohngenossenschaft Belforterstrasse', 'Wohngenossenschaft Belforterstrasse', 'sekretariat@wg-belforter.ch', NULL, 'wohnbau_coop', FALSE, '2026-05-01'::timestamptz),
  ('Wohngenossenschaft Bündnerstrasse', 'Wohngenossenschaft Bündnerstrasse', 'vermietung@wgbuendnerstrasse.ch', NULL, 'wohnbau_coop', FALSE, '2026-05-01'::timestamptz),
  ('Wohnbaugenossenschaft Rosenbühl', 'Wohnbaugenossenschaft Rosenbühl', 'vorstand@rosenbuehl.ch', NULL, 'wohnbau_coop', FALSE, '2026-05-01'::timestamptz),
  ('Wohnbaugenossenschaft Wohnen im Kern', 'Wohnbaugenossenschaft Wohnen im Kern', 'wbg@wohnenimkern.ch', NULL, 'wohnbau_coop', FALSE, '2026-05-01'::timestamptz),
  ('Wohngenossenschaft Burgfelderstrasse', 'Wohngenossenschaft Burgfelderstrasse', 'wg@burgfelderstrasse.ch', NULL, 'wohnbau_coop', FALSE, '2026-05-01'::timestamptz),
  ('WG Sunshine AG', 'WG Sunshine AG', 'wg@wgsunshine.ch', NULL, 'wohnbau_coop', FALSE, '2026-05-05'::timestamptz),
  ('Wohnbaugenossenschaft Q-Hof', 'Wohnbaugenossenschaft Q-Hof', 'wohnen@quartierhof.ch', NULL, 'wohnbau_coop', FALSE, '2026-05-01'::timestamptz)
ON CONFLICT DO NOTHING;

-- Verify:
-- SELECT COUNT(*) FROM housing WHERE source = 'wohnbau_coop';
