/*
# Create candidates table for centralized data storage

## Summary
Replaces browser localStorage with a central Supabase table so all candidate
submissions are visible to the admin from any device.

## New Tables
- `candidates`
  - `id` (uuid, primary key) — unique candidate record ID
  - `full_name` (text, not null) — candidate's full name
  - `registration_number` (text, not null) — exam registration number
  - `phone_number` (text, not null) — 10-digit phone
  - `email` (text, not null) — email address
  - `gender` (text, not null) — 'Male' or 'Female'
  - `category_applied` (text, not null) — category applied for (General, EWS, OBC, SC, ST, PWD)
  - `category` (text, not null) — Tier-1 qualified category
  - `shortlisted_dv` (text, not null) — 'Yes' or 'No'
  - `applied_other_post` (text, not null) — 'Yes' or 'No'
  - `shortlisted_other_post` (text, not null) — 'Yes' or 'No'
  - `tier1_marks` (numeric, not null) — Tier-1 exam marks
  - `tier2_marks` (numeric, not null) — Tier-2 exam marks
  - `photo_data_url` (text, nullable) — base64 data URL of uploaded marks proof photo
  - `created_at` (timestamptz, default now()) — submission timestamp

## Security
- Row Level Security enabled on `candidates`.
- This is a single-tenant app with no user sign-in; the admin authenticates via
  a local password only. All data is intentionally shared/public across the app.
- Four separate policies (SELECT, INSERT, UPDATE, DELETE) scoped to
  `anon, authenticated` with `USING (true)` / `WITH CHECK (true)` because the
  data is intentionally public/shared.

## Important Notes
1. The frontend uses the anon key (no Supabase Auth sign-in), so policies MUST
   include the `anon` role or the app will see an empty table.
2. The admin password remains stored in the browser (localStorage) — it gates
   access to the admin UI only, not database access.
3. `photo_data_url` stores base64 image data directly in the table (screenshots
   under 2 MB). This avoids needing Supabase Storage for this use case.
*/

CREATE TABLE IF NOT EXISTS candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  registration_number text NOT NULL,
  phone_number text NOT NULL,
  email text NOT NULL,
  gender text NOT NULL CHECK (gender IN ('Male', 'Female')),
  category_applied text NOT NULL,
  category text NOT NULL,
  shortlisted_dv text NOT NULL CHECK (shortlisted_dv IN ('Yes', 'No')),
  applied_other_post text NOT NULL CHECK (applied_other_post IN ('Yes', 'No')),
  shortlisted_other_post text NOT NULL CHECK (shortlisted_other_post IN ('Yes', 'No')),
  tier1_marks numeric NOT NULL DEFAULT 0,
  tier2_marks numeric NOT NULL DEFAULT 0,
  photo_data_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_candidates" ON candidates;
CREATE POLICY "anon_select_candidates"
ON candidates FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "anon_insert_candidates" ON candidates;
CREATE POLICY "anon_insert_candidates"
ON candidates FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_candidates" ON candidates;
CREATE POLICY "anon_update_candidates"
ON candidates FOR UPDATE
TO anon, authenticated
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_candidates" ON candidates;
CREATE POLICY "anon_delete_candidates"
ON candidates FOR DELETE
TO anon, authenticated
USING (true);
