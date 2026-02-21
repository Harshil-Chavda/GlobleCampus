import { createClient } from "@supabase/supabase-js";
import MaterialClient from "./MaterialClient";

// Initialize Supabase Client for Server Side
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function generateMetadata({ params }) {
  const { id } = await params;

  const { data: material } = await supabase
    .from("materials")
    .select("title, description, material_type, subject")
    .eq("id", id)
    .single();

  if (!material) {
    return {
      title: "Material Not Found | GlobalCampus",
      description: "The requested study material could not be found.",
    };
  }

  return {
    title: `${material.title} | ${material.subject} Study Material`,
    description:
      material.description ||
      `Download ${material.title} for ${material.subject}. Free study material on GlobalCampus.`,
    openGraph: {
      title: `${material.title} | GlobalCampus`,
      description: material.description,
      type: "article",
    },
  };
}

export default async function MaterialPage({ params }) {
  const { id } = await params;

  // Fetch data
  const { data: material, error } = await supabase
    .from("materials")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !material) {
    return <div>Material not found</div>;
  }

  // JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: material.title,
    description: material.description,
    educationalLevel: material.course,
    learningResourceType: material.material_type,
    inLanguage: material.language,
    author: {
      "@type": "Person",
      name: material.uploaded_by,
    },
    datePublished: material.created_at,
    url: `https://globlecampus.com/dashboard/materials/${id}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MaterialClient initialMaterial={material} />
    </>
  );
}
