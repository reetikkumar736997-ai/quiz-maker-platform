import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type PublicResultPageProps = {
  params: Promise<{ slug: string; attemptId: string }>;
};

export default async function PublicResultPage({ params }: PublicResultPageProps) {
  const { slug, attemptId } = await params;

  const attempt = await prisma.attempt.findFirst({
    where: {
      id: attemptId,
      quiz: {
        slug,
      },
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
    <main className="app-shell stack-xl">
      <section className="hero-compact stack-md">
        <p className="eyebrow result-heading">Quiz result</p>
        <h1>{attempt.quiz.title}</h1>
        <p className="lead">YOU SCORED : {attempt.totalScore}/{attempt.totalQuestions}</p>
      </section>

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
                            Your choice
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
                  <p className="result-chip-label">Your answer</p>
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
                {answer.isCorrect ? "Correct answer selected" : "Incorrect answer"}
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

      <div className="button-row">
        <Link className="button button-secondary" href={`/quiz/${slug}`}>
          Retake quiz
        </Link>
        <Link className="button button-ghost" href="/">
          Back home
        </Link>
      </div>
    </main>
  );
}
