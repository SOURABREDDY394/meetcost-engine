# Supabase setup

1. Open the Supabase project SQL Editor.
2. Paste and run `schema.sql`.
3. Enable an authentication provider under Authentication > Providers.
4. Add `http://localhost:3000` to the allowed redirect URLs.

The publishable key is sufficient for browser and authenticated RLS access. Do not
put a service-role key in client-side code.
