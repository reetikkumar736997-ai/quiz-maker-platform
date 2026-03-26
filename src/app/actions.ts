"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearAdminSession, createAdminSession, requireAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { evaluateAttempt, saveQuiz } from "@/lib/quiz";
import { attemptSchema, loginSchema, quizEditorSchema, registerSchema } from "@/lib/validation";

export type FormState = {
  error?: string;
};

export async function loginAction(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid login input." };
  }

  const admin = await prisma.adminUser.findUnique({
    where: { email: parsed.data.email },
  });

  if (!admin) {
    return { error: "Invalid email or password." };
  }

  const isValidPassword = await bcrypt.compare(parsed.data.password, admin.passwordHash);

  if (!isValidPassword) {
    return { error: "Invalid email or password." };
  }

  await createAdminSession(admin.id);
  redirect("/admin/quizzes");
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/");
}

export async function registerAction(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid signup input." };
  }

  const existingAdmin = await prisma.adminUser.findUnique({
    where: { email: parsed.data.email },
  });

  if (existingAdmin) {
    return { error: "An admin account already exists with this email." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  const admin = await prisma.adminUser.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
    },
  });

  await createAdminSession(admin.id);
  redirect("/");
}

export async function saveQuizAction(_: FormState, formData: FormData): Promise<FormState> {
  await requireAdminUser();

  const rawPayload = formData.get("quizPayload");

  if (typeof rawPayload !== "string") {
    return { error: "Quiz payload is missing." };
  }

  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(rawPayload);
  } catch {
    return { error: "Quiz payload is invalid JSON." };
  }

  const parsed = quizEditorSchema.safeParse(parsedJson);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Quiz data is invalid." };
  }

  const quizId = await saveQuiz(parsed.data);

  revalidatePath("/admin/quizzes");
  revalidatePath(`/admin/quizzes/${quizId}`);
  redirect(`/admin/quizzes/${quizId}?saved=1`);
}

export async function deleteQuizAction(formData: FormData) {
  await requireAdminUser();

  const quizId = formData.get("quizId");

  if (typeof quizId === "string" && quizId) {
    await prisma.quiz.delete({
      where: { id: quizId },
    });
  }

  revalidatePath("/admin/quizzes");
}

export async function deleteAttemptAction(formData: FormData) {
  await requireAdminUser();

  const attemptId = formData.get("attemptId");
  const quizId = formData.get("quizId");

  if (typeof attemptId === "string" && attemptId) {
    await prisma.attempt.delete({
      where: { id: attemptId },
    });
  }

  if (typeof quizId === "string" && quizId) {
    revalidatePath(`/admin/quizzes/${quizId}/results`);
  }
}

export async function submitAttemptAction(_: FormState, formData: FormData): Promise<FormState> {
  const quizId = formData.get("quizId");
  const participantName = formData.get("participantName");
  const elapsedSeconds = formData.get("elapsedSeconds");
  const rawAnswers = formData.get("answers");

  if (typeof rawAnswers !== "string") {
    return { error: "Answers were not submitted." };
  }

  let answers: Record<string, string | undefined>;

  try {
    answers = JSON.parse(rawAnswers) as Record<string, string | undefined>;
  } catch {
    return { error: "Answers payload is invalid." };
  }

  const parsed = attemptSchema.safeParse({
    quizId,
    participantName,
    elapsedSeconds,
    answers,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Attempt is invalid." };
  }

  let result;

  try {
    result = await evaluateAttempt(
      parsed.data.quizId,
      parsed.data.participantName,
      parsed.data.answers,
      parsed.data.elapsedSeconds,
    );
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to submit quiz.",
    };
  }

  revalidatePath(`/admin/quizzes/${result.quiz.id}/results`);
  redirect(`/quiz/${result.quiz.slug}/result/${result.attemptId}`);
}
