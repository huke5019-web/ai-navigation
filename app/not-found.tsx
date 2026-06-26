import Link from "next/link";

export default function NotFound() {
  return (
    <main className="empty-page">
      <h1>Page Not Found</h1>
      <p>The page you requested is unavailable, moved, or not published yet.</p>
      <div className="empty-page-actions">
        <Link href="/">Go Home</Link>
        <Link href="/blog">Browse Blog</Link>
      </div>
    </main>
  );
}
