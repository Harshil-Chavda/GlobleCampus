const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");

const envFile = fs.readFileSync(".env.local", "utf8");
const supabaseUrl = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const supabaseKey = envFile.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim();

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase
    .from("support_queries")
    .select("*")
    .limit(1);
  if (error) {
    console.error("ERROR checking support_queries:", error.message);
  } else {
    console.log("support_queries exists. 1st row:", data);
  }
}
check();
