-- Seed test data pro user 4165025e-78c9-4988-972e-6304ce8622a0 (Václav)
-- Vlozi 9 sent_applications + 2 replies (rejection + positive) plus zachova
-- existujici Anna Keller interview reply.
-- Idempotentni: nejdriv smaze test data, pak inserne.

-- ============================================================================
-- 0. Smazat predchozi test data (krome existujici id=1 Anna Keller)
-- ============================================================================
DELETE FROM application_replies
WHERE member_id = '4165025e-78c9-4988-972e-6304ce8622a0'
  AND from_email IN ('recruiter@swisspost.ch', 'recruiter@adecco.ch');

DELETE FROM sent_applications
WHERE member_id = '4165025e-78c9-4988-972e-6304ce8622a0'
  AND id > 1
  AND gmail_message_id LIKE 'test-msg-%';

-- ============================================================================
-- 1. Insert 9 sent_applications spread over last 7 days
-- ============================================================================
INSERT INTO sent_applications (member_id, to_email, subject, body_preview, gmail_message_id, sent_at)
VALUES
  -- Pred 6 dny — 2 emaily (start tydne)
  ('4165025e-78c9-4988-972e-6304ce8622a0', 'jobs@coopag.ch', 'Bewerbung als Lagermitarbeiter',
   'Sehr geehrte Damen und Herren, hiermit bewerbe ich mich um die Stelle als Lagermitarbeiter...',
   'test-msg-002', NOW() - INTERVAL '6 days'),
  ('4165025e-78c9-4988-972e-6304ce8622a0', 'careers@adecco.ch', 'Initiativbewerbung Logistik',
   'Sehr geehrte Damen und Herren, ich interessiere mich fuer eine Stelle im Bereich Logistik...',
   'test-msg-003', NOW() - INTERVAL '6 days' + INTERVAL '2 hours'),

  -- Pred 5 dny — 1 email
  ('4165025e-78c9-4988-972e-6304ce8622a0', 'hr@swisspost.ch', 'Bewerbung Logistikmitarbeiter',
   'Sehr geehrte Damen und Herren, mit grossem Interesse habe ich Ihre Stellenausschreibung gelesen...',
   'test-msg-004', NOW() - INTERVAL '5 days'),

  -- Pred 4 dny — 2 emaily
  ('4165025e-78c9-4988-972e-6304ce8622a0', 'jobs@manpower.ch', 'Bewerbung als Lagerist',
   'Sehr geehrte Damen und Herren...', 'test-msg-005', NOW() - INTERVAL '4 days'),
  ('4165025e-78c9-4988-972e-6304ce8622a0', 'hr@kuehne-nagel.ch', 'Bewerbung Spedition',
   'Sehr geehrte Damen und Herren...', 'test-msg-006', NOW() - INTERVAL '4 days' + INTERVAL '5 hours'),

  -- Pred 3 dny — 1 email
  ('4165025e-78c9-4988-972e-6304ce8622a0', 'careers@dhl.ch', 'Bewerbung Kurierfahrer',
   'Sehr geehrte Damen und Herren...', 'test-msg-007', NOW() - INTERVAL '3 days'),

  -- Pred 2 dny — 2 emaily
  ('4165025e-78c9-4988-972e-6304ce8622a0', 'jobs@digitec.ch', 'Bewerbung Lagermitarbeiter',
   'Sehr geehrte Damen und Herren...', 'test-msg-008', NOW() - INTERVAL '2 days'),
  ('4165025e-78c9-4988-972e-6304ce8622a0', 'hr@adecco.ch', 'Bewerbung Produktionsmitarbeiter',
   'Sehr geehrte Damen und Herren...', 'test-msg-009', NOW() - INTERVAL '2 days' + INTERVAL '3 hours'),

  -- Vcera — 1 email
  ('4165025e-78c9-4988-972e-6304ce8622a0', 'jobs@coop.ch', 'Bewerbung Verkauf',
   'Sehr geehrte Damen und Herren...', 'test-msg-010', NOW() - INTERVAL '1 day');

-- ============================================================================
-- 2. Insert 2 replies (positive + rejection) — Anna Keller interview uz existuje
-- ============================================================================

-- POSITIVE reply na Swiss Post (4 dny zpet)
INSERT INTO application_replies (application_id, member_id, from_email, from_name, subject, body_text, classification, classification_confidence, received_at)
SELECT id, member_id, 'maria.mueller@swisspost.ch', 'Maria Müller', 'Re: Bewerbung Logistikmitarbeiter',
  'Sehr geehrter Herr Kocka, vielen Dank fuer Ihre Bewerbung. Wir haben Ihre Unterlagen erhalten und werden uns in den kommenden Tagen bei Ihnen melden. Freundliche Gruesse, Maria Mueller',
  'positive', 0.78,
  NOW() - INTERVAL '4 days' + INTERVAL '6 hours'
FROM sent_applications
WHERE member_id = '4165025e-78c9-4988-972e-6304ce8622a0'
  AND to_email = 'hr@swisspost.ch'
  AND gmail_message_id = 'test-msg-004';

-- REJECTION reply na Adecco (5 dny zpet — 1 den po odeslani)
INSERT INTO application_replies (application_id, member_id, from_email, from_name, subject, body_text, classification, classification_confidence, received_at)
SELECT id, member_id, 'thomas.weber@adecco.ch', 'Thomas Weber', 'Re: Initiativbewerbung Logistik',
  'Sehr geehrter Herr Kocka, vielen Dank fuer Ihr Interesse an Adecco. Leider muessen wir Ihnen mitteilen, dass wir uns fuer einen anderen Kandidaten entschieden haben. Wir wuenschen Ihnen viel Erfolg fuer Ihre weitere berufliche Zukunft. Freundliche Gruesse, Thomas Weber',
  'rejection', 0.92,
  NOW() - INTERVAL '5 days' + INTERVAL '8 hours'
FROM sent_applications
WHERE member_id = '4165025e-78c9-4988-972e-6304ce8622a0'
  AND to_email = 'careers@adecco.ch'
  AND gmail_message_id = 'test-msg-003';

-- ============================================================================
-- 3. Update aggregaty na sent_applications pro replied apps
-- ============================================================================
UPDATE sent_applications sa
SET reply_received_at = r.received_at,
    reply_count = 1,
    reply_classification = r.classification,
    last_reply_preview = LEFT(r.body_text, 300)
FROM application_replies r
WHERE r.application_id = sa.id
  AND sa.member_id = '4165025e-78c9-4988-972e-6304ce8622a0'
  AND sa.reply_count = 0
  AND r.from_email IN ('maria.mueller@swisspost.ch', 'thomas.weber@adecco.ch');

-- ============================================================================
-- 4. Verify — zobraz souhrn
-- ============================================================================
SELECT
  (SELECT COUNT(*) FROM sent_applications WHERE member_id = '4165025e-78c9-4988-972e-6304ce8622a0') AS total_sent,
  (SELECT COUNT(*) FROM application_replies WHERE member_id = '4165025e-78c9-4988-972e-6304ce8622a0') AS total_replies,
  (SELECT COUNT(*) FROM application_replies WHERE member_id = '4165025e-78c9-4988-972e-6304ce8622a0' AND classification = 'interview') AS interviews,
  (SELECT COUNT(*) FROM application_replies WHERE member_id = '4165025e-78c9-4988-972e-6304ce8622a0' AND classification = 'rejection') AS rejections,
  (SELECT COUNT(*) FROM application_replies WHERE member_id = '4165025e-78c9-4988-972e-6304ce8622a0' AND classification = 'positive') AS positive;
