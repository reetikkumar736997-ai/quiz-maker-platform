"use client";

import { useActionState } from "react";
import { loginAction, type FormState } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";

const initialState: FormState = {};

export function AdminLoginForm() {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <form className="panel stack-lg" action={formAction}>
      <div className="stack-sm">
        <label className="field-label" htmlFor="email">
          Email
        </label>
        <input className="input" id="email" name="email" type="email" placeholder="admin@quizmaker.local" />
      </div>

      <div className="stack-sm">
        <label className="field-label" htmlFor="password">
          Password
        </label>
        <input className="input" id="password" name="password" type="password" placeholder="Enter password" />
      </div>

      {state.error ? <p className="error-text">{state.error}</p> : null}

      <SubmitButton className="button button-primary" label="Login" pendingLabel="Logging in..." />
    </form>
  );
}
