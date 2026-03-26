"use client";

import { useActionState, useMemo, useState } from "react";
import { saveQuizAction, type FormState } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import type { EditorChoice, EditorQuestion, QuizEditorPayload } from "@/types/quiz";

const initialState: FormState = {};

function createId() {
  return Math.random().toString(36).slice(2, 10);
}

function createChoice(): EditorChoice {
  return {
    id: createId(),
    text: "",
    isCorrect: false,
  };
}

function createQuestion(type: "MCQ_SINGLE" | "TEXT"): EditorQuestion {
  return {
    id: createId(),
    prompt: "",
    type,
    explanation: "",
    correctText: "",
    choices: type === "MCQ_SINGLE" ? [createChoice(), createChoice()] : [],
  };
}

type QuizEditorProps = {
  initialValue: QuizEditorPayload;
};

export function QuizEditor({ initialValue }: QuizEditorProps) {
  const [state, formAction] = useActionState(saveQuizAction, initialState);
  const [title, setTitle] = useState(initialValue.title);
  const [description, setDescription] = useState(initialValue.description);
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(initialValue.status);
  const [durationMinutes, setDurationMinutes] = useState(
    initialValue.durationMinutes ? String(initialValue.durationMinutes) : "",
  );
  const [questions, setQuestions] = useState<EditorQuestion[]>(initialValue.questions);

  const payload = useMemo<QuizEditorPayload>(
    () => ({
      id: initialValue.id,
      title,
      description,
      status,
      durationMinutes: durationMinutes.trim() ? Number(durationMinutes) : null,
      questions,
    }),
    [description, durationMinutes, initialValue.id, questions, status, title],
  );

  function updateQuestion(questionId: string, updater: (question: EditorQuestion) => EditorQuestion) {
    setQuestions((current) =>
      current.map((question) => (question.id === questionId ? updater(question) : question)),
    );
  }

  function removeQuestion(questionId: string) {
    setQuestions((current) => current.filter((question) => question.id !== questionId));
  }

  return (
    <form action={formAction} className="stack-xl">
      <input type="hidden" name="quizPayload" value={JSON.stringify(payload)} />

      <section className="panel stack-lg">
        <div className="section-heading stack-sm">
          <p className="eyebrow">Quiz setup</p>
          <h2>Basics and publishing</h2>
        </div>
        <div className="stack-sm">
          <label className="field-label" htmlFor="title">
            Quiz title
          </label>
          <input className="input" id="title" value={title} onChange={(event) => setTitle(event.target.value)} />
        </div>

        <div className="stack-sm">
          <label className="field-label" htmlFor="description">
            Description
          </label>
          <textarea
            className="textarea"
            id="description"
            rows={4}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>

        <div className="stack-sm">
          <label className="field-label" htmlFor="status">
            Status
          </label>
          <select
            className="input"
            id="status"
            value={status}
            onChange={(event) => setStatus(event.target.value as "DRAFT" | "PUBLISHED")}
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </select>
        </div>

        <div className="stack-sm">
          <label className="field-label" htmlFor="durationMinutes">
            Timer in minutes (optional)
          </label>
          <input
            className="input"
            id="durationMinutes"
            inputMode="numeric"
            min="1"
            placeholder="Leave blank for no timer"
            type="number"
            value={durationMinutes}
            onChange={(event) => setDurationMinutes(event.target.value)}
          />
        </div>
      </section>

      <section className="stack-lg">
        {questions.map((question, index) => (
          <article className="panel stack-lg" key={question.id}>
            <div className="section-row question-heading">
              <div className="stack-sm">
                <p className="eyebrow">Question {index + 1}</p>
                <h3>{question.type === "MCQ_SINGLE" ? "Single correct MCQ" : "Text answer"}</h3>
              </div>
              <button className="button button-ghost" type="button" onClick={() => removeQuestion(question.id)}>
                Remove
              </button>
            </div>

            <div className="stack-sm">
              <label className="field-label">Prompt</label>
              <textarea
                className="textarea"
                rows={3}
                value={question.prompt}
                onChange={(event) =>
                  updateQuestion(question.id, (current) => ({ ...current, prompt: event.target.value }))
                }
              />
            </div>

            <div className="stack-sm">
              <label className="field-label">Explanation (optional)</label>
              <textarea
                className="textarea"
                rows={3}
                value={question.explanation}
                onChange={(event) =>
                  updateQuestion(question.id, (current) => ({ ...current, explanation: event.target.value }))
                }
              />
            </div>

            {question.type === "MCQ_SINGLE" ? (
              <div className="stack-md">
                <div className="section-row">
                  <h4>Options</h4>
                  <button
                    className="button button-secondary"
                    type="button"
                    onClick={() =>
                      updateQuestion(question.id, (current) => ({
                        ...current,
                        choices: [...current.choices, createChoice()],
                      }))
                    }
                  >
                    Add option
                  </button>
                </div>

                {question.choices.map((choice) => (
                  <div className="choice-row choice-editor-row" key={choice.id}>
                    <input
                      checked={choice.isCorrect}
                      name={`correct-${question.id}`}
                      onChange={() =>
                        updateQuestion(question.id, (current) => ({
                          ...current,
                          choices: current.choices.map((item) => ({
                            ...item,
                            isCorrect: item.id === choice.id,
                          })),
                        }))
                      }
                      type="radio"
                    />
                    <input
                      className="input"
                      placeholder="Option text"
                      value={choice.text}
                      onChange={(event) =>
                        updateQuestion(question.id, (current) => ({
                          ...current,
                          choices: current.choices.map((item) =>
                            item.id === choice.id ? { ...item, text: event.target.value } : item,
                          ),
                        }))
                      }
                    />
                    <button
                      className="button button-ghost"
                      type="button"
                      onClick={() =>
                        updateQuestion(question.id, (current) => ({
                          ...current,
                          choices: current.choices.filter((item) => item.id !== choice.id),
                        }))
                      }
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="stack-sm">
                <label className="field-label">Correct answer</label>
                <input
                  className="input"
                  value={question.correctText}
                  onChange={(event) =>
                    updateQuestion(question.id, (current) => ({ ...current, correctText: event.target.value }))
                  }
                />
              </div>
            )}
          </article>
        ))}

        <div className="section-row">
          <button
            className="button button-secondary"
            type="button"
            onClick={() => setQuestions((current) => [...current, createQuestion("MCQ_SINGLE")])}
          >
            Add MCQ
          </button>
          <button
            className="button button-secondary"
            type="button"
            onClick={() => setQuestions((current) => [...current, createQuestion("TEXT")])}
          >
            Add text question
          </button>
        </div>
      </section>

      {state.error ? <p className="error-text">{state.error}</p> : null}

      <SubmitButton className="button button-primary" label="Save quiz" pendingLabel="Saving quiz..." />
    </form>
  );
}
