import Link from "next/link";
import { notFound } from "next/navigation";
import { QuizEditor } from "@/components/quiz-editor";
import { prisma } from "@/lib/prisma";
import type { QuizEditorPayload } from "@/types/quiz";

type EditQuizPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
};

export default async function EditQuizPage({ params, searchParams }: EditQuizPageProps) {
  const { id } = await params;
  const { saved } = await searchParams;

  const quiz = await prisma.quiz.findUnique({
    where: { id },
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

  const initialValue: QuizEditorPayload = {
    id: quiz.id,
    title: quiz.title,
    description: quiz.description ?? "",
    status: quiz.status,
    durationMinutes: quiz.durationMinutes,
    questions: quiz.questions.map((question) => ({
      id: question.id,
      prompt: question.prompt,
      type: question.type,
      explanation: question.explanation ?? "",
      correctText: question.correctText ?? "",
      choices: question.choices.map((choice) => ({
        id: choice.id,
        text: choice.text,
        isCorrect: choice.isCorrect,
      })),
    })),
  };

  return (
    <section className="stack-xl">
      <div className="section-row">
        <div className="stack-sm">
          <p className="eyebrow">Edit quiz</p>
          <h1>{quiz.title}</h1>
          <p className="muted-text">Share link: /quiz/{quiz.slug}</p>
        </div>
        <Link className="button button-secondary" href={`/admin/quizzes/${quiz.id}/results`}>
          View results
        </Link>
      </div>

      {saved ? <p className="success-text">Quiz saved successfully.</p> : null}

      <QuizEditor initialValue={initialValue} />
    </section>
  );
}
