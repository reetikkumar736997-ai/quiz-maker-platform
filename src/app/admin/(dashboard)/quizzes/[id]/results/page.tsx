import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteAttemptAction } from "@/app/actions";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { prisma } from "@/lib/prisma";
import { formatDate, formatElapsedTime } from "@/lib/utils";

type QuizResultsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function QuizResultsPage({ params }: QuizResultsPageProps) {
  const { id } = await params;

  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: {
      attempts: {
        orderBy: { submittedAt: "desc" },
      },
    },
  });

  if (!quiz) {
    notFound();
  }

  return (
    <section className="stack-xl">
      <div className="section-row">
        <div className="stack-sm">
          <p className="eyebrow results-heading">Results</p>
          <h1>{quiz.title}</h1>
        </div>
        <Link className="button button-secondary" href={`/admin/quizzes/${quiz.id}`}>
          Back to edit
        </Link>
      </div>

      <section className="stats-grid">
        <article className="stat-card">
          <span className="stat-value">{quiz.attempts.length}</span>
          <span className="stat-label">Total attempts</span>
        </article>
        <article className="stat-card">
          <span className="stat-value">
            {quiz.attempts.length
              ? Math.round(
                  quiz.attempts.reduce((sum, attempt) => sum + (attempt.totalScore / attempt.totalQuestions) * 100, 0) /
                    quiz.attempts.length,
                )
              : 0}
            %
          </span>
          <span className="stat-label">Average score</span>
        </article>
      </section>

      {quiz.attempts.length === 0 ? (
        <div className="panel empty-state stack-sm">
          <p className="eyebrow">No submissions</p>
          <h2>No attempts yet</h2>
          <p className="muted-text">Publish the quiz link and this area will start filling with participant results.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table results-table">
            <colgroup>
              <col className="results-col-participant" />
              <col className="results-col-score" />
              <col className="results-col-duration" />
              <col className="results-col-submitted" />
              <col className="results-col-actions" />
            </colgroup>
            <thead>
              <tr>
                <th>Participant</th>
                <th>Score</th>
                <th>Time taken</th>
                <th>Submitted</th>
                <th className="table-actions-head">Actions</th>
              </tr>
            </thead>
            <tbody>
              {quiz.attempts.map((attempt) => (
                <tr key={attempt.id}>
                  <td>{attempt.participantName}</td>
                  <td>
                    {attempt.totalScore}/{attempt.totalQuestions}
                  </td>
                  <td>{formatElapsedTime(attempt.elapsedSeconds)}</td>
                  <td>{formatDate(attempt.submittedAt)}</td>
                  <td className="table-actions-cell">
                    <div className="row-actions">
                      <Link className="inline-link" href={`/admin/quizzes/${quiz.id}/results/${attempt.id}`}>
                        View detail
                      </Link>
                      <form action={deleteAttemptAction}>
                        <input name="attemptId" type="hidden" value={attempt.id} />
                        <input name="quizId" type="hidden" value={quiz.id} />
                        <ConfirmSubmitButton
                          className="inline-action-danger"
                          confirmMessage="Delete this submission?"
                          label="Delete"
                        />
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
