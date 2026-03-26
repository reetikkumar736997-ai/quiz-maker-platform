import { QuizEditor } from "@/components/quiz-editor";
import type { QuizEditorPayload } from "@/types/quiz";

const initialValue: QuizEditorPayload = {
  title: "",
  description: "",
  status: "DRAFT",
  durationMinutes: null,
  questions: [],
};

export default function NewQuizPage() {
  return (
    <section className="stack-xl">
      <div className="stack-sm">
        <p className="eyebrow">Create</p>
        <h1>New quiz</h1>
      </div>
      <QuizEditor initialValue={initialValue} />
    </section>
  );
}
