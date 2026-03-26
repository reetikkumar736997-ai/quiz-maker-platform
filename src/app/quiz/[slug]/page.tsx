import { QuizStatus } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AttemptForm } from "@/components/attempt-form";
import { prisma } from "@/lib/prisma";

type PublicQuizPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PublicQuizPage({ params }: PublicQuizPageProps) {
  const { slug } = await params;

  const quiz = await prisma.quiz.findUnique({
    where: { slug },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: {
          choices: { orderBy: { order: "asc" } },
        },
      },
    },
  });

  if (!quiz) {
    notFound();
  }

  if (quiz.status !== QuizStatus.PUBLISHED) {
    return (
      <main className="app-shell">
        <section className="panel stack-lg">
          <p className="eyebrow">Quiz unavailable</p>
          <h1>{quiz.title}</h1>
          <p>This quiz is still in draft mode and is not accepting attempts yet.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell stack-xl">
      <section className="public-quiz-banner">
        <p className="public-quiz-banner-title">LAXREET_QUIZ</p>
      </section>

      <section className="hero-compact stack-md">
        <p className="eyebrow">Public quiz</p>
        <h1>{quiz.title}</h1>
        <p className="lead">{quiz.description ?? "Answer all questions and submit once to see your result."}</p>
        <div className="stats-row stat-pill-row">
          <span className="mini-stat">{quiz.questions.length} questions</span>
          <span className="mini-stat">
            {quiz.durationMinutes ? `${quiz.durationMinutes} minute timer` : "No timer"}
          </span>
          <span className="mini-stat">Instant result page</span>
        </div>
      </section>

      <AttemptForm
        quizId={quiz.id}
        durationMinutes={quiz.durationMinutes}
        questions={quiz.questions.map((question) => ({
          id: question.id,
          prompt: question.prompt,
          type: question.type,
          choices: question.choices.map((choice) => ({
            id: choice.id,
            text: choice.text,
          })),
        }))}
      />

      <div className="button-row">
        <Link className="button button-ghost" href="/">
          Back to home
        </Link>
      </div>
    </main>
  );
}
