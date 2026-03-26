import Link from "next/link";
import { deleteQuizAction } from "@/app/actions";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function AdminQuizzesPage() {
  const quizzes = await prisma.quiz.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      _count: {
        select: {
          questions: true,
          attempts: true,
        },
      },
    },
  });

  return (
    <section className="stack-xl">
      <div className="section-row">
        <div className="stack-sm">
          <p className="eyebrow">Dashboard</p>
          <h1>All quizzes</h1>
        </div>
        <Link className="button button-primary" href="/admin/quizzes/new">
          New quiz
        </Link>
      </div>

      <section className="stats-grid">
        <article className="stat-card">
          <span className="stat-value">{quizzes.length}</span>
          <span className="stat-label">Total quizzes</span>
        </article>
        <article className="stat-card">
          <span className="stat-value">{quizzes.filter((quiz) => quiz.status === "PUBLISHED").length}</span>
          <span className="stat-label">Published</span>
        </article>
        <article className="stat-card">
          <span className="stat-value">{quizzes.reduce((sum, quiz) => sum + quiz._count.attempts, 0)}</span>
          <span className="stat-label">Attempts collected</span>
        </article>
      </section>

      <div className="grid-list dashboard-cards">
        {quizzes.length === 0 ? (
          <article className="panel empty-state stack-sm">
            <p className="eyebrow">No quizzes yet</p>
            <h2>Create your first quiz</h2>
            <p className="muted-text">Start with a draft, then publish when you are ready to share a public link.</p>
          </article>
        ) : null}
        {quizzes.map((quiz) => (
          <article className="panel stack-lg" key={quiz.id}>
            <div className="section-row">
              <div className="stack-sm">
                <div className="pill-row">
                  <span className={`pill ${quiz.status === "PUBLISHED" ? "pill-success" : ""}`}>{quiz.status}</span>
                  <span className="pill">/{quiz.slug}</span>
                </div>
                <h2>{quiz.title}</h2>
                <p className="muted-text">{quiz.description ?? "No description provided."}</p>
              </div>
            </div>

            <div className="stats-row stat-pill-row">
              <span className="mini-stat">{quiz._count.questions} questions</span>
              <span className="mini-stat">{quiz._count.attempts} attempts</span>
              <span className="mini-stat">Updated {formatDate(quiz.updatedAt)}</span>
            </div>

            <div className="button-row">
              <Link className="button button-secondary" href={`/admin/quizzes/${quiz.id}`}>
                Edit
              </Link>
              <Link className="button button-secondary" href={`/admin/quizzes/${quiz.id}/results`}>
                Results
              </Link>
              <Link className="button button-secondary" href={`/quiz/${quiz.slug}`} target="_blank">
                Open link
              </Link>
            </div>

            <form action={deleteQuizAction}>
              <input name="quizId" type="hidden" value={quiz.id} />
              <ConfirmSubmitButton
                className="button button-ghost"
                confirmMessage="Delete this quiz? This will also remove its submissions."
                label="Delete quiz"
              />
            </form>
          </article>
        ))}
      </div>
    </section>
  );
}
