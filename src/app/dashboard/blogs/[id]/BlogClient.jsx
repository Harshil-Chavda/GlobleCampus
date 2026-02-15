"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import styles from "./BlogDetail.module.css";

export default function BlogClient({ initialBlog }) {
  const [blog, setBlog] = useState(initialBlog);
  const router = useRouter();

  useEffect(() => {
    const incrementView = async () => {
      if (initialBlog?.id) {
        await supabase
          .from("blogs")
          .update({ views: (initialBlog.views || 0) + 1 })
          .eq("id", initialBlog.id);
      }
    };
    incrementView();
  }, [initialBlog]);

  if (!blog) {
    return (
      <div className={styles.errorScreen}>
        <div className={styles.errorEmoji}>📝</div>
        <h2>Blog Not Found</h2>
        <p>This blog may have been removed or doesn't exist.</p>
        <Link href="/dashboard/blogs" className={styles.backBtn}>
          ← Back to Blogs
        </Link>
      </div>
    );
  }

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const wordCount = blog?.content?.split(/\s+/).filter(Boolean).length || 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link href="/dashboard/blogs" className={styles.breadcrumbLink}>
          Blogs
        </Link>
        <span className={styles.breadcrumbSep}>›</span>
        <span className={styles.breadcrumbCurrent}>{blog.title}</span>
      </div>

      {/* Article Header */}
      <article className={styles.article}>
        <div className={styles.articleHeader}>
          {blog.category && (
            <span className={styles.categoryBadge}>{blog.category}</span>
          )}
          <h1 className={styles.articleTitle}>{blog.title}</h1>
          {blog.excerpt && (
            <p className={styles.articleExcerpt}>{blog.excerpt}</p>
          )}
          <div className={styles.authorRow}>
            <div className={styles.authorAvatar}>
              {blog.author_name?.[0]?.toUpperCase() || "?"}
            </div>
            <div>
              <div className={styles.authorName}>{blog.author_name}</div>
              <div className={styles.articleMeta}>
                {formatDate(blog.created_at)} · {readTime} min read · 👁️{" "}
                {blog.views || 0} views
              </div>
            </div>
          </div>
        </div>

        {/* Article Body */}
        <div
          className={styles.articleBody}
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className={styles.tagsSection}>
            {blog.tags.map((tag, i) => (
              <span key={i} className={styles.tag}>
                #{tag}
              </span>
            ))}
          </div>
        )}
      </article>

      {/* Bottom nav */}
      <div className={styles.bottomNav}>
        <Link href="/dashboard/blogs" className={styles.backBtn}>
          ← Back to Blogs
        </Link>
        <Link href="/dashboard/blogs/write" className={styles.writeBtn}>
          ✏️ Write Your Own
        </Link>
      </div>
    </div>
  );
}
