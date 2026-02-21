const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");

const envFile = fs.readFileSync(".env.local", "utf8");
const supabaseUrl = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const supabaseKey = envFile.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim();

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: users, error: ue } = await supabase.auth.admin.listUsers();
  const { data: profiles, error: pe } = await supabase
    .from("profiles")
    .select("*");

  if (ue || pe) {
    console.error(ue, pe);
    return;
  }

  console.log("Total Auth Users:", users.users.length);
  console.log("Total Profiles:", profiles.length);

  console.log("\n--- Profiles with Admin or > 50 GC ---");
  profiles
    .filter((p) => p.is_admin || p.gc_token_balance >= 50)
    .forEach((p) => {
      console.log(
        `- Email: ${p.email} | GC: ${p.gc_token_balance} | Admin: ${p.is_admin}`,
      );
      const authUser = users.users.find((u) => u.id === p.id);
      console.log(`  Auth Record Found: ${!!authUser}`);
    });
}
check();
