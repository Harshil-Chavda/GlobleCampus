import { createClient } from "@supabase/supabase-js";
import { getAllMaterials } from "./materials-data";

export async function POST(req) {
  try {
    // Use service role to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );

    // Get your user ID to assign as owner
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("user_id");
    if (!userId) {
      return Response.json(
        { error: "user_id query param required" },
        { status: 400 },
      );
    }

    const materials = getAllMaterials();

    // Filter only materials with valid external links (Google Drive, OneDrive etc.)
    const valid = materials.filter((m) => m.file_url.startsWith("https://"));

    // Add user_id to each
    const rows = valid.map((m) => ({ ...m, user_id: userId }));

    // Insert in batches of 25
    const results = { inserted: 0, errors: [] };
    for (let i = 0; i < rows.length; i += 25) {
      const batch = rows.slice(i, i + 25);
      const { error } = await supabase.from("materials").insert(batch);
      if (error) {
        results.errors.push({ batch: i / 25, error: error.message });
      } else {
        results.inserted += batch.length;
      }
    }

    return Response.json({
      success: true,
      total: valid.length,
      skipped: materials.length - valid.length,
      ...results,
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
