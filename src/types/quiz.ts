export type EditorQuestionType = "MCQ_SINGLE" | "TEXT";

export type EditorChoice = {
  id: string;
  text: string;
  isCorrect: boolean;
};

export type EditorQuestion = {
  id: string;
  prompt: string;
  type: EditorQuestionType;
  explanation: string;
  correctText: string;
  choices: EditorChoice[];
};

export type QuizEditorPayload = {
  id?: string;
  title: string;
  description: string;
  status: "DRAFT" | "PUBLISHED";
  durationMinutes: number | null;
  questions: EditorQuestion[];
};
