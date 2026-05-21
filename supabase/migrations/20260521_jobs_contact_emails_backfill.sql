-- Smart Apply Faze 3: backfill jobs.contact_emails pro existujici inzeraty.
-- Extrahuje emaily z `description` regexem, filtruje noreply / no-reply / webmaster.
-- Spustit v Supabase SQL editoru (musi byt po 20260518_jobs_contact_emails.sql).
--
-- Po tomto migraci muze /api/jobs?has_contact=1 filtrovat na DB urovni a
-- pagination bude konzistentni s realitou.

-- 1. Backfill existing rows ----------------------------------------------------
WITH extracted AS (
  SELECT
    j.id,
    array_agg(DISTINCT lower(m[1])) FILTER (
      WHERE lower(m[1]) !~ '^(noreply|no-reply|donotreply|do-not-reply|webmaster|mailer-daemon|postmaster)@'
        -- vzdy zfiltruj typicke false positives jako sentry/datadog ingest hosts
        AND lower(m[1]) !~ '@(sentry|datadoghq|google-analytics)\.'
    ) AS emails
  FROM jobs j
  CROSS JOIN LATERAL regexp_matches(
    COALESCE(j.description, ''),
    '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}',
    'g'
  ) AS m
  WHERE (j.contact_emails IS NULL OR array_length(j.contact_emails, 1) IS NULL)
    AND j.description IS NOT NULL
  GROUP BY j.id
)
UPDATE jobs j
SET contact_emails = e.emails
FROM extracted e
WHERE j.id = e.id AND e.emails IS NOT NULL AND array_length(e.emails, 1) > 0;

-- 2. Index pro rychly filter `WHERE contact_emails IS NOT NULL` ---------------
-- Drive existoval index na `WHERE contact_emails IS NULL` (Vrstva 2 dohledavani).
-- Pridame symetricky index pro Smart Apply browse (has_contact=1).
CREATE INDEX IF NOT EXISTS idx_jobs_has_contact
  ON jobs (posted_at DESC NULLS LAST)
  WHERE contact_emails IS NOT NULL;

-- 3. Stats po backfillu --------------------------------------------------------
-- DO $$ DECLARE
--   total_jobs int;
--   with_email int;
-- BEGIN
--   SELECT count(*) INTO total_jobs FROM jobs;
--   SELECT count(*) INTO with_email FROM jobs WHERE contact_emails IS NOT NULL AND array_length(contact_emails, 1) > 0;
--   RAISE NOTICE 'Backfill: % / % jobs maji kontaktni email (%.1f%%)',
--     with_email, total_jobs, (with_email::float / NULLIF(total_jobs, 0) * 100);
-- END $$;
