import { QuestionType, QuizStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { normalizeAnswer, slugify } from "@/lib/utils";
import type { QuizEditorPayload } from "@/types/quiz";

export async function buildUniqueSlug(title: string, quizId?: string) {
  const base = slugify(title) || "quiz";
  let slug = base;
  let suffix = 1;

  while (true) {
    const existing = await prisma.quiz.findUnique({ where: { slug } });

    if (!existing || existing.id === quizId) {
      return slug;
    }

    slug = `${base}-${suffix}`;
    suffix += 1;
  }
}

export async function saveQuiz(payload: QuizEditorPayload) {
  const slug = await buildUniqueSlug(payload.title, payload.id);

  const data = {
    title: payload.title.trim(),
    description: payload.description.trim() || null,
    slug,
    status: payload.status,
    durationMinutes: payload.durationMinutes,
    questions: payload.questions.map((question, questionIndex) => ({
      prompt: question.prompt.trim(),
      type: question.type,
      order: questionIndex + 1,
      explanation: question.explanation.trim() || null,
      correctText: question.type === "TEXT" ? question.correctText.trim() || null : null,
      choices:
        question.type === "MCQ_SINGLE"
          ? {
              create: question.choices.map((choice, choiceIndex) => ({
                text: choice.text.trim(),
                isCorrect: choice.isCorrect,
                order: choiceIndex + 1,
              })),
            }
          : undefined,
    })),
  };

  if (payload.id) {
    await prisma.quiz.update({
      where: { id: payload.id },
      data: {
        title: data.title,
        description: data.description,
        slug: data.slug,
        status: data.status,
        durationMinutes: data.durationMinutes,
        questions: {
          deleteMany: {},
          create: data.questions,
        },
      },
    });

    return payload.id;
  }

  const quiz = await prisma.quiz.create({
    data: {
      title: data.title,
      description: data.description,
      slug: data.slug,
      status: data.status,
      durationMinutes: data.durationMinutes,
      questions: {
        create: data.questions,
      },
    },
  });

  return quiz.id;
}

export async function evaluateAttempt(
  quizId: string,
  participantName: string,
  answers: Record<string, string | undefined>,
  elapsedSeconds: number,
) {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: {
          choices: { orderBy: { order: "asc" } },
        },
      },
    },
  });

  if (!quiz || quiz.status !== QuizStatus.PUBLISHED) {
    throw new Error("Quiz is not available for submissions.");
  }

  const scoredAnswers = quiz.questions.map((question) => {
    const rawAnswer = answers[question.id] ?? "";

    if (question.type === QuestionType.MCQ_SINGLE) {
      const correctChoice = question.choices.find((choice) => choice.isCorrect);
      const isCorrect = Boolean(correctChoice && rawAnswer === correctChoice.id);

      return {
        questionId: question.id,
        selectedChoiceId: rawAnswer || null,
        textAnswer: null,
        isCorrect,
        awardedScore: isCorrect ? 1 : 0,
      };
    }

    const normalizedSubmitted = normalizeAnswer(rawAnswer);
    const normalizedCorrect = normalizeAnswer(question.correctText ?? "");
    const isCorrect = Boolean(normalizedSubmitted && normalizedSubmitted === normalizedCorrect);

    return {
      questionId: question.id,
      selectedChoiceId: null,
      textAnswer: rawAnswer.trim() || null,
      isCorrect,
      awardedScore: isCorrect ? 1 : 0,
    };
  });

  const totalScore = scoredAnswers.reduce((sum, answer) => sum + answer.awardedScore, 0);

  const attempt = await prisma.attempt.create({
    data: {
      quizId: quiz.id,
      participantName: participantName.trim() || "Anonymous",
      elapsedSeconds,
      totalScore,
      totalQuestions: quiz.questions.length,
      answers: {
        create: scoredAnswers,
      },
    },
  });

  return {
    quiz,
    attemptId: attempt.id,
  };
}
