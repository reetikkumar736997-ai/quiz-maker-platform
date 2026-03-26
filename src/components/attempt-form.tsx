"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { submitAttemptAction, type FormState } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";

type AttemptQuestion = {
  id: string;
  prompt: string;
  type: "MCQ_SINGLE" | "TEXT";
  choices: {
    id: string;
    text: string;
  }[];
};

type AttemptFormProps = {
  quizId: string;
  durationMinutes: number | null;
  questions: AttemptQuestion[];
};

const initialState: FormState = {};

function formatTimeLeft(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function AttemptForm({ quizId, durationMinutes, questions }: AttemptFormProps) {
  const [state, formAction] = useActionState(submitAttemptAction, initialState);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(
    durationMinutes ? durationMinutes * 60 : null,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const elapsedSecondsInputRef = useRef<HTMLInputElement>(null);
  const autoSubmitButtonRef = useRef<HTMLButtonElement>(null);
  const hasAutoSubmitted = useRef(false);
  const startedAtRef = useRef<number | null>(null);

  const serializedAnswers = useMemo(() => JSON.stringify(answers), [answers]);

  const syncElapsedSeconds = () => {
    if (!elapsedSecondsInputRef.current) {
      return;
    }

    if (startedAtRef.current === null) {
      startedAtRef.current = Date.now();
    }

    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - startedAtRef.current) / 1000));
    elapsedSecondsInputRef.current.value = String(elapsedSeconds);
  };

  useEffect(() => {
    if (startedAtRef.current === null) {
      startedAtRef.current = Date.now();
    }
  }, []);

  useEffect(() => {
    if (!durationMinutes || hasAutoSubmitted.current) {
      return;
    }

    const timerId = window.setInterval(() => {
      setTimeLeftSeconds((current) => {
        if (current === null) {
          return null;
        }

        if (current <= 1) {
          window.clearInterval(timerId);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [durationMinutes]);

  useEffect(() => {
    if (timeLeftSeconds !== 0 || hasAutoSubmitted.current) {
      return;
    }

    hasAutoSubmitted.current = true;

    if (nameInputRef.current && !nameInputRef.current.value.trim()) {
      nameInputRef.current.value = "Anonymous";
    }

    syncElapsedSeconds();

    const submitTimer = window.setTimeout(() => {
      autoSubmitButtonRef.current?.click();
    }, 0);

    return () => window.clearTimeout(submitTimer);
  }, [timeLeftSeconds]);

  return (
    <form
      action={formAction}
      className="stack-xl quiz-form"
      onSubmitCapture={syncElapsedSeconds}
      ref={formRef}
    >
      <input type="hidden" name="quizId" value={quizId} />
      <input type="hidden" name="answers" value={serializedAnswers} />
      <input name="elapsedSeconds" ref={elapsedSecondsInputRef} type="hidden" value="0" />

      {timeLeftSeconds !== null ? (
        <>
          <div aria-hidden="true" className="timer-strip-spacer" />
          <section className="timer-strip timer-strip-floating">
            <span className="timer-label">Time left</span>
            <strong className="timer-value">{formatTimeLeft(timeLeftSeconds)}</strong>
          </section>
          <section className="timer-strip timer-strip-inline">
            <span className="timer-label">Time left</span>
            <strong className="timer-value">{formatTimeLeft(timeLeftSeconds)}</strong>
          </section>
        </>
      ) : null}

      <section className="panel stack-lg">
        <div className="stack-sm">
          <label className="field-label" htmlFor="participantName">
            Your name
          </label>
          <input
            className="input"
            id="participantName"
            name="participantName"
            placeholder="Enter your name"
            ref={nameInputRef}
          />
        </div>
      </section>

      {questions.map((question, index) => (
        <section className="panel stack-lg" key={question.id}>
          <div className="stack-sm">
            <p className="eyebrow">Question {index + 1}</p>
            <h3>{question.prompt}</h3>
          </div>

          {question.type === "MCQ_SINGLE" ? (
            <div className="stack-sm">
              {question.choices.map((choice) => (
                <label
                  className={`option-card ${
                    answers[question.id] === choice.id ? "option-card-selected" : ""
                  }`}
                  key={choice.id}
                >
                  <input
                    checked={answers[question.id] === choice.id}
                    name={`question-${question.id}`}
                    onChange={() =>
                      setAnswers((current) => ({
                        ...current,
                        [question.id]: choice.id,
                      }))
                    }
                    type="radio"
                  />
                  <span>{choice.text}</span>
                </label>
              ))}
            </div>
          ) : (
            <textarea
              className="textarea"
              rows={4}
              placeholder="Type your answer"
              value={answers[question.id] ?? ""}
              onChange={(event) =>
                setAnswers((current) => ({
                  ...current,
                  [question.id]: event.target.value,
                }))
              }
            />
          )}
        </section>
      ))}

      {state.error ? <p className="error-text">{state.error}</p> : null}

      <button hidden ref={autoSubmitButtonRef} type="submit" />
      <SubmitButton className="button button-primary" label="Submit quiz" pendingLabel="Submitting..." />
    </form>
  );
}
