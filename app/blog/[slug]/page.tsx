import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { blogArticles, getArticleBySlug, getAllSlugs } from "../../../lib/blog-data";
import CopyLinkButton from "./CopyLinkButton";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};
  return {
    title: `${article.title} | Woker Blog`,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      url: `https://www.gowoker.com/blog/${article.slug}`,
      siteName: "Woker",
      locale: "cs_CZ",
      type: "article",
      publishedTime: article.date,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
    },
  };
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0a0a12",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <article
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "48px 20px 80px",
        }}
      >
        {/* Back link */}
        <Link
          href="/blog"
          style={{
            color: "rgba(255,255,255,0.55)",
            textDecoration: "none",
            fontSize: 14,
            display: "inline-block",
            marginBottom: 40,
          }}
        >
          ← Zpět na blog
        </Link>

        {/* Header */}
        <header style={{ marginBottom: 40 }}>
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

          <h1
            style={{
              color: "#fff",
              fontSize: 36,
              fontWeight: 800,
              lineHeight: 1.25,
              margin: "0 0 16px",
              letterSpacing: "-0.02em",
            }}
          >
            {article.title}
          </h1>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              color: "rgba(255,255,255,0.3)",
              fontSize: 14,
            }}
          >
            <span>{formatDate(article.date)}</span>
            <span style={{ opacity: 0.3 }}>·</span>
            <span>{article.readingTime}</span>
          </div>
        </header>

        {/* Article content */}
        <div
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Share */}
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            marginTop: 48,
            paddingTop: 24,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span
            style={{
              color: "rgba(255,255,255,0.3)",
              fontSize: 14,
            }}
          >
            Sdílet:
          </span>
          <CopyLinkButton />
        </div>

        {/* CTA Box */}
        <div
          style={{
            marginTop: 48,
            background: "linear-gradient(135deg, #1a3a22 0%, #0f2818 100%)",
            border: "1px solid rgba(57,255,110,0.2)",
            borderRadius: 16,
            padding: "36px 32px",
            textAlign: "center",
          }}
        >
          <h3
            style={{
              color: "#fff",
              fontSize: 22,
              fontWeight: 800,
              margin: "0 0 10px",
            }}
          >
            Začni hledat práci ve Švýcarsku
          </h3>
          <p
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: 15,
              margin: "0 0 24px",
              lineHeight: 1.6,
            }}
          >
            1 007 kontaktů na firmy a agentury. AI životopis, motivační dopis,
            příprava na pohovor — vše v jedné appce.
          </p>
          <Link
            href="/login"
            style={{
              display: "inline-block",
              background: "#39ff6e",
              color: "#0a0a12",
              fontWeight: 700,
              fontSize: 15,
              padding: "12px 32px",
              borderRadius: 10,
              textDecoration: "none",
            }}
          >
            Vyzkoušet Woker zdarma →
          </Link>
        </div>
      </article>

      {/* Blog content styles */}
      <style>{`
        .blog-content {
          color: rgba(255,255,255,0.8);
          font-size: 16px;
          line-height: 1.75;
        }
        .blog-content h2 {
          color: #fff;
          font-size: 24px;
          font-weight: 700;
          margin: 40px 0 16px;
          letter-spacing: -0.01em;
        }
        .blog-content h3 {
          color: #fff;
          font-size: 19px;
          font-weight: 700;
          margin: 32px 0 12px;
        }
        .blog-content p {
          margin: 0 0 16px;
        }
        .blog-content ul,
        .blog-content ol {
          margin: 0 0 16px;
          padding-left: 24px;
        }
        .blog-content li {
          margin-bottom: 8px;
        }
        .blog-content strong {
          color: #fff;
          font-weight: 600;
        }
        .blog-content a {
          color: #39ff6e;
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .blog-content a:hover {
          opacity: 0.8;
        }
        .blog-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          font-size: 14px;
        }
        .blog-content thead th {
          text-align: left;
          color: rgba(255,255,255,0.5);
          font-weight: 600;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 10px 12px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .blog-content tbody td {
          padding: 10px 12px;
          color: rgba(255,255,255,0.75);
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .blog-content tbody tr:hover td {
          background: rgba(255,255,255,0.02);
        }
        .blog-content .info-box {
          background: #111120;
          border: 1px solid rgba(57,255,110,0.12);
          border-left: 3px solid #39ff6e;
          border-radius: 10px;
          padding: 18px 20px;
          margin: 24px 0;
          font-size: 14px;
          line-height: 1.65;
          color: rgba(255,255,255,0.7);
        }
        .blog-content .info-box strong {
          color: #39ff6e;
        }
        .blog-content .info-box a {
          color: #39ff6e;
        }
      `}</style>
    </main>
  );
}
