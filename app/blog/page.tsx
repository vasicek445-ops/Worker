import type { Metadata } from "next";
import Link from "next/link";
import { blogArticles } from "../../lib/blog-data";

export const metadata: Metadata = {
  title: "Blog — Práce ve Švýcarsku | Woker",
  description:
    "Články, tipy a průvodce pro Čechy hledající práci ve Švýcarsku. Platy, povolení, jazyky a další.",
  openGraph: {
    title: "Blog — Práce ve Švýcarsku | Woker",
    description:
      "Články, tipy a průvodce pro Čechy hledající práci ve Švýcarsku.",
    url: "https://www.gowoker.com/blog",
    siteName: "Woker",
    locale: "cs_CZ",
    type: "website",
  },
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function BlogPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0a0a12",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "48px 20px 0",
        }}
      >
        <Link
          href="/"
          style={{
            color: "rgba(255,255,255,0.55)",
            textDecoration: "none",
            fontSize: 14,
            display: "inline-block",
            marginBottom: 32,
          }}
        >
          ← Zpět na hlavní stránku
        </Link>
        <h1
          style={{
            color: "#fff",
            fontSize: 40,
            fontWeight: 800,
            margin: "0 0 12px",
            letterSpacing: "-0.02em",
          }}
        >
          Blog
        </h1>
        <p
          style={{
            color: "rgba(255,255,255,0.55)",
            fontSize: 18,
            margin: "0 0 48px",
            maxWidth: 600,
            lineHeight: 1.6,
          }}
        >
          Praktické články a průvodce pro Čechy, kteří chtějí pracovat ve
          Švýcarsku.
        </p>
      </div>

      {/* Article grid */}
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 20px 64px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: 24,
        }}
      >
        {blogArticles.map((article) => (
          <Link
            key={article.slug}
            href={`/blog/${article.slug}`}
            style={{ textDecoration: "none", display: "block" }}
          >
            <article
              style={{
                background: "#111120",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 16,
                padding: 28,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "border-color 0.2s, transform 0.2s",
              }}
              onMouseEnter={undefined}
            >
              {/* Tags */}
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  marginBottom: 16,
                }}
              >
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#39ff6e",
                      background: "rgba(57,255,110,0.08)",
                      padding: "4px 10px",
                      borderRadius: 6,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Title */}
              <h2
                style={{
                  color: "#fff",
                  fontSize: 20,
                  fontWeight: 700,
                  margin: "0 0 12px",
                  lineHeight: 1.35,
                  letterSpacing: "-0.01em",
                }}
              >
                {article.title}
              </h2>

              {/* Excerpt */}
              <p
                style={{
                  color: "rgba(255,255,255,0.55)",
                  fontSize: 14,
                  lineHeight: 1.6,
                  margin: "0 0 20px",
                  flex: 1,
                }}
              >
                {article.description}
              </p>

              {/* Meta */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  color: "rgba(255,255,255,0.3)",
                  fontSize: 13,
                }}
              >
                <span>{formatDate(article.date)}</span>
                <span style={{ opacity: 0.3 }}>·</span>
                <span>{article.readingTime}</span>
              </div>
            </article>
          </Link>
        ))}
      </div>

      {/* CTA Banner */}
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 20px 80px",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #111120 0%, #0a0a12 100%)",
            border: "1px solid rgba(57,255,110,0.15)",
            borderRadius: 20,
            padding: "48px 36px",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              color: "#fff",
              fontSize: 28,
              fontWeight: 800,
              margin: "0 0 12px",
            }}
          >
            Hledáš práci ve Švýcarsku?
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,0.55)",
              fontSize: 16,
              margin: "0 0 28px",
              maxWidth: 500,
              marginLeft: "auto",
              marginRight: "auto",
              lineHeight: 1.6,
            }}
          >
            1 007 kontaktů na firmy, AI životopis, motivační dopis a kompletní
            průvodce. Vše v jedné appce.
          </p>
          <Link
            href="/#pricing"
            style={{
              display: "inline-block",
              background: "#39ff6e",
              color: "#0a0a12",
              fontWeight: 700,
              fontSize: 16,
              padding: "14px 36px",
              borderRadius: 12,
              textDecoration: "none",
              transition: "opacity 0.2s",
            }}
          >
            Zobrazit ceník →
          </Link>
        </div>
      </div>
    </main>
  );
}
