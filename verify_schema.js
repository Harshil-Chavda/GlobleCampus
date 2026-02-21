const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Manually parse .env.local
const envPath = path.resolve(__dirname, ".env.local");
const envVars = {};

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const [key, ...valParts] = line.split("=");
    if (key && valParts.length > 0) {
      envVars[key.trim()] = valParts
        .join("=")
        .trim()
        .replace(/^"/, "")
        .replace(/"$/, "");
    }
  });
}

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey || !supabaseUrl) {
  console.error("❌ Could not read Supabase credentials from .env.local");
  console.log("Found keys:", Object.keys(envVars));
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifySchema() {
  console.log("🔍 Checking 'profiles' table columns...");

  // Try to insert a dummy record with all fields to see which one fails,
  // or better, query metadata if possible.
  // Since we can't easily query pg_catalog via JS client without a function,
  // we'll try a select with the columns we expect.

  const expectedColumns = [
    "id",
    "email",
    "first_name",
    "last_name",
    "role",
    "about",
    "country",
    "state",
    "college",
    "specialization",
    "skills",
    "company",
    "job_role",
    "gc_token_balance",
  ];

  // We fetch one row and check keys, or rely on error if select fails?
  // Select * returns all columns.
  const { data, error } = await supabase.from("profiles").select("*").limit(1);

  if (error) {
    console.error("❌ Error querying profiles:", error.message);
    return;
  }

  if (data.length === 0) {
    console.log(
      "⚠️ Table is empty, cannot verify columns by row inspection. Trying to insert and rollback (simulated).",
    );
    console.log(
      "ℹ️ Actually, if you recently ran the SQL, it should be fine. But let's check for specific missing columns by checking the error of a bad select.",
    );
  }

  // Check strict selection
  const { error: colError } = await supabase
    .from("profiles")
    .select(expectedColumns.join(","))
    .limit(1);

  if (colError) {
    console.error("❌ Critical Schema Mismatch! Missing columns?");
    console.error(colError.message);
  } else {
    console.log("✅ All required columns seem to exist in 'profiles'.");
  }

  console.log("\n🔍 Checking 'gc_transactions' table...");
  const { error: txError } = await supabase
    .from("gc_transactions")
    .select("id")
    .limit(1);
  if (txError) {
    console.error(
      "❌ 'gc_transactions' table might be missing:",
      txError.message,
    );
  } else {
    console.log("✅ 'gc_transactions' table exists.");
  }
}

verifySchema();
