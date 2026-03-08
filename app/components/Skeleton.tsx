"use client";

export function Skeleton({
  width,
  height,
  radius = "12px",
  className = "",
}: {
  width?: string;
  height?: string;
  radius?: string;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        width: width || "100%",
        height: height || "20px",
        borderRadius: radius,
        background: "linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 100%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s ease-in-out infinite",
      }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div
      style={{
        background: "#111120",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "16px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <Skeleton height="14px" width="60%" />
      <Skeleton height="12px" width="40%" />
      <Skeleton height="36px" radius="10px" />
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          style={{
            background: "#111120",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "14px",
            padding: "14px 10px",
            textAlign: "center",
          }}
        >
          <Skeleton height="24px" width="50%" className="mx-auto" />
          <div style={{ height: "6px" }} />
          <Skeleton height="10px" width="70%" className="mx-auto" />
        </div>
      ))}
      <style>{`
        .mx-auto { margin-left: auto; margin-right: auto; }
      `}</style>
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {[...Array(count)].map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0a0a12",
        padding: "20px",
        fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
      }}
    >
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <div style={{ marginBottom: "24px" }}>
          <Skeleton height="28px" width="200px" />
          <div style={{ height: "8px" }} />
          <Skeleton height="14px" width="140px" />
        </div>
        <SkeletonStats />
        <div style={{ height: "20px" }} />
        <SkeletonList count={4} />
      </div>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </main>
  );
}
