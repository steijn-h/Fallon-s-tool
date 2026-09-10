// Verifies that Row Level Security actually isolates two seeded test
// organizations from each other. Run against a local Supabase instance that
// has been seeded with `supabase db reset` (see supabase/seed.sql).
//
//   node --env-file=.env.local scripts/verify-rls.mjs
//
// Uses the anon key and real sign-ins, exactly like the Next.js app would —
// this is deliberately NOT using the service role key, so a pass here means
// RLS itself is doing the isolating, not application code.

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. Run with --env-file=.env.local.",
  );
  process.exit(1);
}

const ORG_A = { id: "11111111-1111-1111-1111-000000000001", label: "Sportgala Events (pakket a)" };
const ORG_B = { id: "11111111-1111-1111-1111-000000000002", label: "Verenigingsdiensten BV (pakket b)" };

const USER_A = { email: "sanne@sportgala-events.test", password: "Wachtwoord123!" };
const USER_B = { email: "fatima@verenigingsdiensten.test", password: "Wachtwoord123!" };

let failures = 0;

function check(label, condition, details) {
  if (condition) {
    console.log(`PASS  ${label}`);
  } else {
    failures += 1;
    console.log(`FAIL  ${label}${details ? ` — ${details}` : ""}`);
  }
}

async function signedInClient(credentials) {
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { error } = await client.auth.signInWithPassword(credentials);
  if (error) {
    throw new Error(`Could not sign in as ${credentials.email}: ${error.message}`);
  }
  return client;
}

async function main() {
  console.log(`Signing in as ${USER_A.email} (${ORG_A.label}) and ${USER_B.email} (${ORG_B.label})...\n`);

  const clientA = await signedInClient(USER_A);
  const clientB = await signedInClient(USER_B);

  // 1. Each user only ever sees their own organization's profiles.
  const { data: profilesA } = await clientA.from("profiles").select("id, organization_id");
  const { data: profilesB } = await clientB.from("profiles").select("id, organization_id");

  check(
    "User A sees only Org A profiles",
    (profilesA ?? []).length > 0 && (profilesA ?? []).every((p) => p.organization_id === ORG_A.id),
    `got organization_ids: ${[...new Set((profilesA ?? []).map((p) => p.organization_id))]}`,
  );
  check(
    "User B sees only Org B profiles",
    (profilesB ?? []).length > 0 && (profilesB ?? []).every((p) => p.organization_id === ORG_B.id),
    `got organization_ids: ${[...new Set((profilesB ?? []).map((p) => p.organization_id))]}`,
  );

  // 2. Explicitly querying the other org's id returns nothing (RLS filters silently).
  const { data: crossQuery } = await clientA
    .from("profiles")
    .select("id")
    .eq("organization_id", ORG_B.id);
  check("User A querying Org B's organization_id directly returns 0 rows", (crossQuery ?? []).length === 0);

  // 3. Can't read the other organization's row in `organizations`.
  const { data: otherOrg } = await clientA.from("organizations").select("id").eq("id", ORG_B.id);
  check("User A cannot read Org B's organizations row", (otherOrg ?? []).length === 0);

  // 4. Can't insert a profile into the other organization.
  const { error: insertError } = await clientA.from("profiles").insert({
    organization_id: ORG_B.id,
    organization_name: "RLS test intrusion attempt",
  });
  check(
    "User A cannot INSERT a profile with Org B's organization_id",
    insertError !== null,
    insertError ? undefined : "insert unexpectedly succeeded",
  );

  // 5. Can't update another organization's data even by row id (need a real
  //    Org B profile id: fetch it as user B, then attempt the update as user A).
  const targetProfileId = (profilesB ?? [])[0]?.id;
  if (targetProfileId) {
    const { data: updateResult } = await clientA
      .from("profiles")
      .update({ organization_name: "Hijacked" })
      .eq("id", targetProfileId)
      .select();
    check(
      "User A cannot UPDATE an Org B profile by id",
      (updateResult ?? []).length === 0,
    );
  }

  console.log(`\n${failures === 0 ? "All checks passed." : `${failures} check(s) FAILED.`}`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
