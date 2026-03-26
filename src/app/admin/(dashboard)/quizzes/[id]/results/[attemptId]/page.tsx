import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate, formatElapsedTime } from "@/lib/utils";

type AttemptDetailPageProps = {
  params: Promise<{ id: string; attemptId: string }>;
};

export default async function AttemptDetailPage({ params }: AttemptDetailPageProps) {
  const { id, attemptId } = await params;

  const attempt = await prisma.attempt.findFirst({
    where: {
      id: attemptId,
      quizId: id,
    },
    include: {
      quiz: true,
      answers: {
        include: {
          question: {
            include: {
              choices: { orderBy: { order: "asc" } },
            },
          },
          selectedChoice: true,
        },
        orderBy: {
          question: {
            order: "asc",
          },
        },
      },
    },
  });

  if (!attempt) {
    notFound();
  }

  return (
    <section className="stack-xl">
      <div className="section-row">
        <div className="stack-sm">
          <p className="eyebrow">Attempt detail</p>
          <h1>{attempt.participantName}</h1>
          <p className="muted-text">
            Submitted {formatDate(attempt.submittedAt)} | Score {attempt.totalScore}/{attempt.totalQuestions} | Time taken{" "}
            {formatElapsedTime(attempt.elapsedSeconds)}
          </p>
        </div>
        <Link className="button button-secondary" href={`/admin/quizzes/${attempt.quizId}/results`}>
          Back to results
        </Link>
      </div>

      {attempt.answers.map((answer, index) => {
        const correctChoice = answer.question.choices.find((choice) => choice.isCorrect);
        const hasChoices = answer.question.choices.length > 0;

        return (
          <article className="panel stack-md" key={answer.id}>
            <div className="stack-sm">
              <p className="eyebrow">Question {index + 1}</p>
              <h3>{answer.question.prompt}</h3>
            </div>
            {hasChoices ? (
              <div className="stack-sm">
                {answer.question.choices.map((choice) => {
                  const isSelected = answer.selectedChoice?.id === choice.id;
                  const isCorrectOption = choice.isCorrect;

                  let optionClassName = "review-option";
                  if (isCorrectOption) {
                    optionClassName += " review-option-correct";
                  }
                  if (isSelected && !isCorrectOption) {
                    optionClassName += " review-option-wrong";
                  }

                  return (
                    <div className={optionClassName} key={choice.id}>
                      <div className="review-option-main">
                        <span className="review-option-indicator">{isSelected ? "●" : "○"}</span>
                        <span>{choice.text}</span>
                      </div>
                      <div className="review-option-tags">
                        {isSelected ? (
                          <span className={`review-tag ${isCorrectOption ? "review-tag-correct" : "review-tag-wrong"}`}>
                            Selected
                          </span>
                        ) : null}
                        {isCorrectOption ? <span className="review-tag review-tag-correct">Correct</span> : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="result-meta-grid">
                <div className="result-chip">
                  <p className="result-chip-label">Submitted answer</p>
                  <p className="result-chip-value">{answer.selectedChoice?.text ?? answer.textAnswer ?? "No answer"}</p>
                </div>
                <div className="result-chip result-chip-correct">
                  <p className="result-chip-label">Correct answer</p>
                  <p className="result-chip-value">{correctChoice?.text ?? answer.question.correctText ?? "Not set"}</p>
                </div>
              </div>
            )}
            {!hasChoices ? (
              <div className={`status-banner ${answer.isCorrect ? "status-banner-success" : "status-banner-error"}`}>
                {answer.isCorrect ? "Marked correct" : "Marked incorrect"}
              </div>
            ) : null}
            {answer.question.explanation ? (
              <div className="explanation-box stack-sm">
                <p className="explanation-title">Explanation</p>
                <p className="muted-text">{answer.question.explanation}</p>
              </div>
            ) : null}
          </article>
        );
      })}
    </section>
  );
}
