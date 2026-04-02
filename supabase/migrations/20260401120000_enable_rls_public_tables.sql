-- Lock down app data exposed via Supabase PostgREST (anon + JWT authenticated roles).
-- Without RLS, anyone with your project URL and the publishable (anon) key can read/write
-- public tables through /rest/v1/... — the key is bundled in the frontend by design.
--
-- With RLS enabled and no policies, those API roles see no rows and cannot insert/update/delete.
-- Your Django backend uses a direct Postgres connection (typically the postgres role), which
-- bypasses RLS, so ORM access is unchanged.
--
-- Apply on the hosted project: Dashboard → SQL Editor → run this file, or:
--   supabase link --project-ref <ref> && supabase db push
--
-- After new Django migrations create tables, run the DO block again or add a follow-up migration.

DO $$
DECLARE
	t text;
BEGIN
	FOR t IN
		SELECT c.relname
		FROM pg_class c
		JOIN pg_namespace n ON n.oid = c.relnamespace
		WHERE n.nspname = 'public'
			AND c.relkind = 'r'
			AND c.relname NOT IN ('spatial_ref_sys')
	LOOP
		EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
	END LOOP;
END $$;
