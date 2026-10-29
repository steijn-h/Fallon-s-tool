// Verifies SponsorHub's RLS model: this is a single-club, single-tenant app
// where every signed-in staff member has equal, full access — so there is
// no "organization X vs Y" isolation to test here. What RLS must guarantee
// instead is simpler but just as important: nobody who ISN'T signed in can
// read or write anything at all.
//
//   node --env-file=.env.local scripts/verify-rls.mjs
//
// Optionally also verifies the authenticated side, if you provide a real
// staff login:
//
//   TEST_USER_EMAIL=you@club.test TEST_USER_PASSWORD=... \
//     node --env-file=.env.local scripts/verify-rls.mjs

import { createClient } from "@supabase/supabase-js";

// supabase-js always spins up a realtime client, which needs a native
// WebSocket — only built into Node 22+. Polyfill it so this script also runs
// on Node 20 (still a common LTS), without requiring everyone to upgrade.
if (typeof globalThis.WebSocket === "undefined") {
  const { WebSocket } = await import("ws");
  globalThis.WebSocket = WebSocket;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. Run with --env-file=.env.local.",
  );
  process.exit(1);
}

const TABLES = ["prospects", "sponsorships", "owners", "handles", "pipeline_stages"];

let failures = 0;

function check(label, condition, details) {
  if (condition) {
    console.log(`PASS  ${label}`);
  } else {
    failures += 1;
    console.log(`FAIL  ${label}${details ? ` — ${details}` : ""}`);
  }
}

async function main() {
  console.log("Checking that an anonymous (signed-out) client cannot read any table...\n");

  const anon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  for (const table of TABLES) {
    const { data, error } = await anon.from(table).select("id").limit(1);
    // RLS with no matching policy for the anon role returns an empty result,
    // not necessarily an error — either outcome is fine, seeing actual rows
    // is the only failure.
    check(
      `Anonymous client cannot read rows from "${table}"`,
      !error && (data ?? []).length === 0,
      error ? error.message : `got ${data?.length ?? 0} row(s)`,
    );
  }

  const { data: insertData, error: insertError } = await anon
    .from("prospects")
    .insert({ company: "RLS test intrusion attempt", industry: "Tech", stage_id: "lead" })
    .select();
  check(
    "Anonymous client cannot INSERT into prospects",
    !!insertError || (insertData ?? []).length === 0,
    insertError ? undefined : "insert unexpectedly returned rows",
  );

  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  if (email && password) {
    console.log(`\nChecking that a signed-in user (${email}) CAN read data...\n`);
    const authed = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { error: signInError } = await authed.auth.signInWithPassword({ email, password });

    if (signInError) {
      check("Sign-in with TEST_USER_EMAIL/TEST_USER_PASSWORD succeeds", false, signInError.message);
    } else {
      for (const table of TABLES) {
        const { error } = await authed.from(table).select("id").limit(1);
        check(`Signed-in user can query "${table}" without an RLS error`, !error, error?.message);
      }
    }
  } else {
    console.log(
      "\n(Skipping the authenticated-access check — set TEST_USER_EMAIL and TEST_USER_PASSWORD to also verify that a signed-in staff account can read data.)",
    );
  }

  console.log(`\n${failures === 0 ? "All checks passed." : `${failures} check(s) FAILED.`}`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
