import Link from "next/link";

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0a0a12",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
        padding: "24px",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: "440px" }}>
        <div
          style={{
            fontSize: "80px",
            fontWeight: 900,
            background: "linear-gradient(135deg, #39ff6e, #2bcc58)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            lineHeight: 1,
            marginBottom: "16px",
          }}
        >
          404
        </div>
        <h1
          style={{
            color: "white",
            fontSize: "24px",
            fontWeight: 800,
            marginBottom: "12px",
          }}
        >
          Stránka nenalezena
        </h1>
        <p
          style={{
            color: "rgba(255,255,255,0.45)",
            fontSize: "15px",
            lineHeight: 1.6,
            marginBottom: "32px",
          }}
        >
          Tato stránka neexistuje nebo byla přesunuta.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <Link
            href="/"
            style={{
              background: "linear-gradient(135deg, #39ff6e, #2bcc58)",
              color: "#0a0a12",
              padding: "14px 28px",
              borderRadius: "12px",
              fontSize: "15px",
              fontWeight: 700,
              textDecoration: "none",
              transition: "all 0.2s",
            }}
          >
            Zpět na hlavní stránku
          </Link>
          <Link
            href="/dashboard"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "white",
              padding: "14px 28px",
              borderRadius: "12px",
              fontSize: "15px",
              fontWeight: 600,
              textDecoration: "none",
              transition: "all 0.2s",
            }}
          >
            Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
