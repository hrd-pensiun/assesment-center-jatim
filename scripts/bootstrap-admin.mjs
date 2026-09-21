// One-off bootstrap: creates the first assessment_admin account.
// Usage: node scripts/bootstrap-admin.mjs <email> <password>
// Requires .env.local to be loaded (run via `node --env-file=.env.local scripts/bootstrap-admin.mjs ...`).
import { createClient, createAdminClient } from "@insforge/sdk";

const [, , email, password] = process.argv;
if (!email || !password) {
  console.error("Usage: node --env-file=.env.local scripts/bootstrap-admin.mjs <email> <password>");
  process.exit(1);
}

const anon = createClient({
  baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL,
  anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY,
});

const { data, error } = await anon.auth.signUp({ email, password });
if (error || !data?.user) {
  console.error("Sign up failed:", error);
  process.exit(1);
}

const admin = createAdminClient({
  baseUrl: process.env.INSFORGE_URL,
  apiKey: process.env.INSFORGE_API_KEY,
});

const { error: insertError } = await admin.database
  .from("assessment_admin_users")
  .insert([{ user_id: data.user.id }]);

if (insertError) {
  console.error("Failed to grant assessment_admin role:", insertError);
  process.exit(1);
}

console.log(`assessment_admin created: ${email} (user_id ${data.user.id})`);
