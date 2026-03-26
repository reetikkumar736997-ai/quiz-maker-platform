import { z } from "zod";

const choiceSchema = z.object({
  id: z.string().min(1),
  text: z.string().trim().min(1, "Each option needs text."),
  isCorrect: z.boolean(),
});

const questionSchema = z
  .object({
    id: z.string().min(1),
    prompt: z.string().trim().min(1, "Each question needs a prompt."),
    type: z.enum(["MCQ_SINGLE", "TEXT"]),
    explanation: z.string().default(""),
    correctText: z.string().default(""),
    choices: z.array(choiceSchema).default([]),
  })
  .superRefine((question, ctx) => {
    if (question.type === "MCQ_SINGLE") {
      if (question.choices.length < 2) {
        ctx.addIssue({
          code: "custom",
          path: ["choices"],
          message: "MCQ questions need at least two options.",
        });
      }

      const correctChoices = question.choices.filter((choice) => choice.isCorrect);
      if (correctChoices.length !== 1) {
        ctx.addIssue({
          code: "custom",
          path: ["choices"],
          message: "MCQ questions need exactly one correct option.",
        });
      }
    }

    if (question.type === "TEXT" && !question.correctText.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["correctText"],
        message: "Text questions need a correct answer.",
      });
    }
  });

export const quizEditorSchema = z.object({
  id: z.string().min(1).optional(),
  title: z.string().trim().min(1, "Quiz title is required."),
  description: z.string().default(""),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  durationMinutes: z
    .number()
    .int("Timer must be a whole number of minutes.")
    .min(1, "Timer must be at least 1 minute.")
    .max(180, "Timer cannot be more than 180 minutes.")
    .nullable(),
  questions: z.array(questionSchema).min(1, "Add at least one question."),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email."),
  password: z.string().min(1, "Password is required."),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters."),
    email: z.string().trim().email("Enter a valid email."),
    password: z.string().min(6, "Password must be at least 6 characters."),
    confirmPassword: z.string().min(1, "Confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const attemptSchema = z.object({
  participantName: z.string().trim().min(1, "Name is required."),
  elapsedSeconds: z.coerce.number().int().min(0).max(60 * 60 * 12),
  quizId: z.string().min(1),
  answers: z.record(z.string(), z.string().optional()),
});
