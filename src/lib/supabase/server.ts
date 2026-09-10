import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database } from "./database.types";

// Used in Server Components, Server Actions and Route Handlers. All data
// access for the signed-in user must go through this client so Postgres RLS
// (organization_id / role) is the thing enforcing tenant isolation — never
// the anon/service-role key from client-side code.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component that can't set cookies (no
            // response object). Session refresh is handled in middleware.ts.
          }
        },
      },
    },
  );
}
