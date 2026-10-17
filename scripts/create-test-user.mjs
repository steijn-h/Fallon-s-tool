// Maakt direct een bevestigd staf-testaccount aan via de Supabase Admin API —
// handig omdat zelfregistratie in deze app bewust uitstaat (enable_signup =
// false), dus een account aanmaken kan anders alleen via de Supabase-
// dashboard (Authentication → Add user).
//
// Vereist de SERVICE ROLE key, niet de anon key. Die key omzeilt RLS
// volledig — zet hem alleen in .env.local (nooit committen, nooit in
// NEXT_PUBLIC_* zetten, nooit in de browser gebruiken).
//
//   node --env-file=.env.local scripts/create-test-user.mjs jij@club.test EenSterkWachtwoord123

import { createClient } from "@supabase/supabase-js";

if (typeof globalThis.WebSocket === "undefined") {
  const { WebSocket } = await import("ws");
  globalThis.WebSocket = WebSocket;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const [, , email, password] = process.argv;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY. Run with --env-file=.env.local.",
  );
  process.exit(1);
}

if (!email || !password) {
  console.error("Gebruik: node --env-file=.env.local scripts/create-test-user.mjs <email> <wachtwoord>");
  process.exit(1);
}

if (password.length < 8) {
  console.error("Wachtwoord moet minstens 8 tekens lang zijn.");
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data, error } = await admin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});

if (error) {
  console.error("Aanmaken mislukt:", error.message);
  process.exit(1);
}

console.log(`Testaccount aangemaakt: ${data.user.email}`);
console.log("Je kunt hiermee direct inloggen op /login — geen bevestigingsmail nodig.");
