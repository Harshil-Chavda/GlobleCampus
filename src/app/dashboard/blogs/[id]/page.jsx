import { createClient } from "@supabase/supabase-js";
import BlogClient from "./BlogClient";

// Initialize Supabase Client for Server Side
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function generateMetadata({ params }) {
  const { id } = params;

  const { data: blog } = await supabase
    .from("blogs")
    .select("title, excerpt, category, author_name")
    .eq("id", id)
    .single();

  if (!blog) {
    return {
      title: "Blog Not Found | GlobalCampus",
      description: "The requested blog post could not be found.",
    };
  }

  return {
    title: `${blog.title} | GlobalCampus Blog`,
    description:
      blog.excerpt ||
      `Read ${blog.title} by ${blog.author_name} on GlobalCampus.`,
    openGraph: {
      title: blog.title,
      description: blog.excerpt,
      type: "article",
      authors: [blog.author_name],
      tags: [blog.category],
    },
  };
}

export default async function BlogPage({ params }) {
  const { id } = params;

  // Fetch data
  const { data: blog, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !blog) {
    return <div>Blog not found</div>;
  }

  // JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    description: blog.excerpt,
    author: {
      "@type": "Person",
      name: blog.author_name,
    },
    datePublished: blog.created_at,
    articleBody: blog.content,
    url: `https://globlecampus.com/dashboard/blogs/${id}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogClient initialBlog={blog} />
    </>
  );
}
