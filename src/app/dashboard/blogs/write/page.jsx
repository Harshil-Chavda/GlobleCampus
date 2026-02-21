"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";
import styles from "./BlogWrite.module.css";

export default function WriteBlogPage() {
  const router = useRouter();
  const editorRef = useRef(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const recognitionRef = useRef(null);
  const [form, setForm] = useState({
    title: "",
    excerpt: "",
    category: "Technology",
    tags: "",
  });

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setUser(session.user);
      const { data } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", session.user.id)
        .single();
      if (data) setProfile(data);
    };
    getUser();
  }, []);

  // --- Formatting commands ---
  const execCmd = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleBold = () => execCmd("bold");
  const handleItalic = () => execCmd("italic");
  const handleUnderline = () => execCmd("underline");
  const handleStrike = () => execCmd("strikeThrough");

  const handleLink = () => {
    const url = prompt("Enter URL:");
    if (url) execCmd("createLink", url);
  };

  const handleHeading = (level) => execCmd("formatBlock", `h${level}`);
  const handleParagraph = () => execCmd("formatBlock", "p");
  const handleBulletList = () => execCmd("insertUnorderedList");
  const handleNumberList = () => execCmd("insertOrderedList");
  const handleBlockquote = () => execCmd("formatBlock", "blockquote");
  const handleCode = () => {
    const sel = window.getSelection();
    if (sel.rangeCount) {
      const range = sel.getRangeAt(0);
      const code = document.createElement("code");
      range.surroundContents(code);
    }
  };
  const handleHR = () => execCmd("insertHorizontalRule");
  const handleUndo = () => execCmd("undo");
  const handleRedo = () => execCmd("redo");
  const handleClearFormat = () => execCmd("removeFormat");

  const handleAlignLeft = () => execCmd("justifyLeft");
  const handleAlignCenter = () => execCmd("justifyCenter");
  const handleAlignRight = () => execCmd("justifyRight");

  // --- Voice to Text ---
  const toggleVoice = () => {
    if (
      !("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      alert(
        "Voice recognition is not supported in this browser. Please use Chrome.",
      );
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-IN";

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          transcript += event.results[i][0].transcript + " ";
        }
      }
      if (transcript && editorRef.current) {
        editorRef.current.focus();
        document.execCommand("insertText", false, transcript);
      }
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognition.start();
    recognitionRef.current = recognition;
    setListening(true);
  };

  // --- AI Write ---
  const handleAiWrite = () => {
    setShowAiModal(true);
  };

  const generateWithAi = async () => {
    if (!aiPrompt.trim()) return;
    setAiGenerating(true);

    // Generate structured content based on the prompt
    const templates = {
      intro: `<h2>Introduction</h2><p>In this article, we'll explore <strong>${aiPrompt}</strong>. Whether you're a beginner or an experienced professional, this guide will help you understand the key concepts and practical applications.</p><p>Let's dive in! 🚀</p>`,
      howto: `<h2>How to ${aiPrompt}</h2><p>Follow these step-by-step instructions to ${aiPrompt.toLowerCase()}:</p><ol><li><strong>Step 1:</strong> Start by understanding the fundamentals.</li><li><strong>Step 2:</strong> Set up your environment and gather the necessary tools.</li><li><strong>Step 3:</strong> Practice with hands-on examples.</li><li><strong>Step 4:</strong> Test your understanding and refine your approach.</li></ol><p><em>Pro tip: Consistency is key — practice a little every day!</em></p>`,
      tips: `<h2>Top Tips for ${aiPrompt}</h2><ul><li><strong>Tip 1:</strong> Start with the basics and build a strong foundation.</li><li><strong>Tip 2:</strong> Use quality resources — textbooks, online courses, and community forums.</li><li><strong>Tip 3:</strong> Practice regularly and track your progress.</li><li><strong>Tip 4:</strong> Join study groups and discuss concepts with peers.</li><li><strong>Tip 5:</strong> Take breaks and maintain a healthy study-life balance.</li></ul>`,
      conclusion: `<h2>Conclusion</h2><p>To summarize, <strong>${aiPrompt}</strong> is a topic that requires dedication and consistent practice. By following the strategies outlined above, you'll be well on your way to mastering this subject.</p><p>Remember: every expert was once a beginner. Keep learning, keep growing! 💪</p>`,
    };

    const prompt = aiPrompt.toLowerCase();
    let generated = "";

    if (prompt.includes("how to") || prompt.includes("guide")) {
      generated = templates.howto;
    } else if (prompt.includes("tips") || prompt.includes("advice")) {
      generated = templates.tips;
    } else if (prompt.includes("conclusion") || prompt.includes("summary")) {
      generated = templates.conclusion;
    } else {
      generated = templates.intro;
    }

    // Simulate a small delay
    await new Promise((r) => setTimeout(r, 800));

    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand("insertHTML", false, generated);
    }

    setAiGenerating(false);
    setShowAiModal(false);
    setAiPrompt("");
  };

  // --- Word count from editor ---
  const getEditorText = useCallback(() => {
    return editorRef.current?.innerText || "";
  }, []);

  const [wordCount, setWordCount] = useState(0);
  const updateWordCount = () => {
    const text = getEditorText();
    setWordCount(text.split(/\s+/).filter(Boolean).length);
  };

  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  // --- Submit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !editorRef.current) return;

    const content = editorRef.current.innerHTML;
    if (!content || content === "<br>" || content.trim() === "") {
      alert("Please write some content for your blog.");
      return;
    }

    setLoading(true);

    const authorName = profile
      ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
      : user.email;

    const { error } = await supabase.from("blogs").insert([
      {
        user_id: user.id,
        author_name: authorName,
        title: form.title,
        excerpt: form.excerpt,
        content: content,
        category: form.category,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        status: "pending",
      },
    ]);

    if (!error) {
      alert("✅ Blog submitted! It will be visible after admin approval.");
      router.push("/dashboard/blogs");
    } else {
      console.error("Blog error:", error);
      alert("❌ Failed to submit blog: " + error.message);
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>✏️ Write a Blog</h1>
        <p className={styles.subtitle}>
          Share your knowledge, experience, or tutorial with the community.
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Title */}
        <div className={styles.field}>
          <label>Blog Title *</label>
          <input
            type="text"
            required
            placeholder="Give your blog a catchy title..."
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className={styles.titleInput}
          />
        </div>

        {/* Excerpt */}
        <div className={styles.field}>
          <label>Short Excerpt</label>
          <input
            type="text"
            placeholder="A brief summary (shown on the card)..."
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            maxLength={200}
          />
          <span className={styles.charCount}>{form.excerpt.length}/200</span>
        </div>

        {/* Category & Tags */}
        <div className={styles.row}>
          <div className={styles.field}>
            <label>Category *</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="Technology">💻 Technology</option>
              <option value="Exam Tips">📝 Exam Tips</option>
              <option value="Interview Prep">🎯 Interview Prep</option>
              <option value="Career">📈 Career</option>
              <option value="Tutorial">🚀 Tutorial</option>
              <option value="Experience">🌍 Experience</option>
              <option value="Other">📌 Other</option>
            </select>
          </div>
          <div className={styles.field}>
            <label>Tags</label>
            <input
              type="text"
              placeholder="e.g. React, DSA, GATE (comma separated)"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
            />
          </div>
        </div>

        {/* Rich Text Editor */}
        <div className={styles.field}>
          <div className={styles.contentHeader}>
            <label>Blog Content *</label>
            <div className={styles.contentMeta}>
              <span>{wordCount} words</span>
              <span>•</span>
              <span>~{readTime} min read</span>
            </div>
          </div>

          {/* Toolbar */}
          <div className={styles.toolbar}>
            <div className={styles.toolGroup}>
              <button
                type="button"
                onClick={handleBold}
                className={styles.toolBtn}
                title="Bold"
              >
                <strong>B</strong>
              </button>
              <button
                type="button"
                onClick={handleItalic}
                className={styles.toolBtn}
                title="Italic"
              >
                <em>I</em>
              </button>
              <button
                type="button"
                onClick={handleUnderline}
                className={styles.toolBtn}
                title="Underline"
              >
                <u>U</u>
              </button>
              <button
                type="button"
                onClick={handleStrike}
                className={styles.toolBtn}
                title="Strikethrough"
              >
                <s>S</s>
              </button>
            </div>

            <div className={styles.toolDivider} />

            <div className={styles.toolGroup}>
              <button
                type="button"
                onClick={() => handleHeading(2)}
                className={styles.toolBtn}
                title="Heading 2"
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => handleHeading(3)}
                className={styles.toolBtn}
                title="Heading 3"
              >
                H3
              </button>
              <button
                type="button"
                onClick={handleParagraph}
                className={styles.toolBtn}
                title="Paragraph"
              >
                ¶
              </button>
            </div>

            <div className={styles.toolDivider} />

            <div className={styles.toolGroup}>
              <button
                type="button"
                onClick={handleBulletList}
                className={styles.toolBtn}
                title="Bullet List"
              >
                •≡
              </button>
              <button
                type="button"
                onClick={handleNumberList}
                className={styles.toolBtn}
                title="Numbered List"
              >
                1.
              </button>
              <button
                type="button"
                onClick={handleBlockquote}
                className={styles.toolBtn}
                title="Quote"
              >
                ❝
              </button>
              <button
                type="button"
                onClick={handleCode}
                className={styles.toolBtn}
                title="Inline Code"
              >
                {"</>"}
              </button>
              <button
                type="button"
                onClick={handleHR}
                className={styles.toolBtn}
                title="Horizontal Rule"
              >
                ―
              </button>
            </div>

            <div className={styles.toolDivider} />

            <div className={styles.toolGroup}>
              <button
                type="button"
                onClick={handleAlignLeft}
                className={styles.toolBtn}
                title="Align Left"
              >
                ≡
              </button>
              <button
                type="button"
                onClick={handleAlignCenter}
                className={styles.toolBtn}
                title="Align Center"
              >
                ≡̈
              </button>
              <button
                type="button"
                onClick={handleAlignRight}
                className={styles.toolBtn}
                title="Align Right"
              >
                ≡
              </button>
            </div>

            <div className={styles.toolDivider} />

            <div className={styles.toolGroup}>
              <button
                type="button"
                onClick={handleLink}
                className={`${styles.toolBtn} ${styles.toolSpecial}`}
                title="Insert Link"
              >
                🔗
              </button>
              <button
                type="button"
                onClick={handleUndo}
                className={styles.toolBtn}
                title="Undo"
              >
                ↩
              </button>
              <button
                type="button"
                onClick={handleRedo}
                className={styles.toolBtn}
                title="Redo"
              >
                ↪
              </button>
              <button
                type="button"
                onClick={handleClearFormat}
                className={styles.toolBtn}
                title="Clear Formatting"
              >
                ✕
              </button>
            </div>

            <div className={styles.toolDivider} />

            {/* Special Tools */}
            <div className={styles.toolGroup}>
              <button
                type="button"
                onClick={toggleVoice}
                className={`${styles.toolBtn} ${styles.toolSpecial} ${listening ? styles.toolActive : ""}`}
                title={listening ? "Stop Voice Input" : "Voice to Text"}
              >
                {listening ? "🔴" : "🎤"}
              </button>
              <button
                type="button"
                onClick={handleAiWrite}
                className={`${styles.toolBtn} ${styles.toolAi}`}
                title="Write with AI"
              >
                ✨ AI
              </button>
            </div>
          </div>

          {/* Listening indicator */}
          {listening && (
            <div className={styles.listeningBar}>
              <span className={styles.listeningDot}></span>
              Listening... Speak now
              <button
                type="button"
                onClick={toggleVoice}
                className={styles.stopBtn}
              >
                Stop
              </button>
            </div>
          )}

          {/* Editor Area */}
          <div
            ref={editorRef}
            contentEditable
            className={styles.editor}
            onInput={updateWordCount}
            data-placeholder="Start writing your blog here..."
            suppressContentEditableWarning
          />
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button
            type="button"
            onClick={() => router.push("/dashboard/blogs")}
            className={styles.cancelBtn}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={styles.publishBtn}
          >
            {loading ? "Publishing..." : "🚀 Publish Blog"}
          </button>
        </div>
      </form>

      {/* AI Modal */}
      {showAiModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowAiModal(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>✨ Write with AI</h3>
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className={styles.modalClose}
              >
                ✕
              </button>
            </div>
            <p className={styles.modalDesc}>
              Describe what you want to write about and AI will generate content
              for you.
            </p>
            <input
              type="text"
              placeholder="e.g. 'Tips for cracking GATE exam' or 'How to learn React'..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className={styles.aiInput}
              onKeyDown={(e) => e.key === "Enter" && generateWithAi()}
              autoFocus
            />
            <div className={styles.aiSuggestions}>
              <span onClick={() => setAiPrompt("How to prepare for GATE exam")}>
                How to prepare for GATE
              </span>
              <span onClick={() => setAiPrompt("Tips for coding interviews")}>
                Tips for interviews
              </span>
              <span onClick={() => setAiPrompt("Guide to learn React.js")}>
                Guide to learn React
              </span>
              <span onClick={() => setAiPrompt("Conclusion and summary")}>
                Write conclusion
              </span>
            </div>
            <button
              type="button"
              onClick={generateWithAi}
              disabled={aiGenerating || !aiPrompt.trim()}
              className={styles.aiGenerateBtn}
            >
              {aiGenerating ? "Generating..." : "✨ Generate Content"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

