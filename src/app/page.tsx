import Link from "next/link";

export default function Home() {
  return (
    <main className="app-shell stack-xl">
      <section className="hero">
        <div className="hero-copy stack-lg">
          <p className="eyebrow">Quiz Maker Platform</p>
          <h1>Create quizzes, publish links, and review every attempt.</h1>
          <p className="lead">
            Admins can build MCQ and text-answer quizzes, share a public URL, and track detailed results from one
            dashboard.
          </p>
          <div className="hero-metrics">
            <div className="metric-card">
              <span className="metric-value">2 formats</span>
              <span className="metric-label">Single-choice MCQ and text-answer prompts</span>
            </div>
            <div className="metric-card">
              <span className="metric-value">1 link</span>
              <span className="metric-label">Publish once and share instantly</span>
            </div>
            <div className="metric-card">
              <span className="metric-value">Detailed review</span>
              <span className="metric-label">Inspect scores and per-question submissions</span>
            </div>
          </div>
          <div className="button-row hero-actions">
            <Link className="button button-primary" href="/admin/login">
              Admin login
            </Link>
            <Link className="button button-secondary" href="/quiz/general-knowledge-demo">
              Try demo quiz
            </Link>
          </div>
        </div>

        <div className="hero-card stack-md">
          <p className="eyebrow">Launch flow</p>
          <h2>From draft to live quiz in a few steps</h2>
          <div className="stack-md">
            <div className="feature-card">
              <strong>1. Draft the quiz</strong>
              <p className="muted-text">Write questions, add explanations, and configure an optional timer.</p>
            </div>
            <div className="feature-card">
              <strong>2. Publish the link</strong>
              <p className="muted-text">Switch the quiz to published and send the public URL to participants.</p>
            </div>
            <div className="feature-card">
              <strong>3. Review attempts</strong>
              <p className="muted-text">Open each submission to check scores, answers, and corrections.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="info-grid">
        <article className="panel stack-md">
          <p className="eyebrow">Included in this build</p>
          <ul className="feature-list feature-checklist">
            <li>Admin login with session cookies</li>
            <li>Quiz create, edit, publish, and share link</li>
            <li>Public attempts with score and solutions</li>
            <li>Result dashboard with per-attempt detail</li>
          </ul>
        </article>

        <article className="panel accent-panel stack-md">
          <p className="eyebrow">Responsive update</p>
          <h2>Cleaner on phones, tighter on desktop</h2>
          <p className="muted-text">
            Forms, cards, and actions now collapse more intentionally so both quiz editing and quiz taking feel usable
            on smaller screens.
          </p>
        </article>
      </section>
    </main>
  );
}
