import { createClient } from "@supabase/supabase-js";

export default async function sitemap() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const baseUrl = "https://globlecampus.com";

  // Static Routes
  const routes = [
    "",
    "/dashboard/materials",
    "/dashboard/blogs",
    "/dashboard/videos",
    "/dashboard/marketplace",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
  }));

  // Dynamic Routes: Materials
  const { data: materials } = await supabase
    .from("materials")
    .select("id, created_at")
    .eq("status", "approved");

  const materialRoutes = (materials || []).map((m) => ({
    url: `${baseUrl}/dashboard/materials/${m.id}`,
    lastModified: m.created_at,
  }));

  // Dynamic Routes: Blogs
  const { data: blogs } = await supabase
    .from("blogs")
    .select("id, created_at")
    .eq("status", "approved");

  const blogRoutes = (blogs || []).map((b) => ({
    url: `${baseUrl}/dashboard/blogs/${b.id}`,
    lastModified: b.created_at,
  }));

  return [...routes, ...materialRoutes, ...blogRoutes];
}
