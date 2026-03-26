"use client";

import { useActionState } from "react";
import { registerAction, type FormState } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";

const initialState: FormState = {};

export function AdminRegisterForm() {
  const [state, formAction] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} className="panel stack-lg">
      <div className="stack-sm">
        <label className="field-label" htmlFor="name">
          Name
        </label>
        <input className="input" id="name" name="name" placeholder="Your name" type="text" />
      </div>

      <div className="stack-sm">
        <label className="field-label" htmlFor="email">
          Email
        </label>
        <input className="input" id="email" name="email" placeholder="admin@example.com" type="email" />
      </div>

      <div className="stack-sm">
        <label className="field-label" htmlFor="password">
          Password
        </label>
        <input className="input" id="password" name="password" placeholder="Create password" type="password" />
      </div>

      <div className="stack-sm">
        <label className="field-label" htmlFor="confirmPassword">
          Confirm password
        </label>
        <input
          className="input"
          id="confirmPassword"
          name="confirmPassword"
          placeholder="Re-enter password"
          type="password"
        />
      </div>

      {state.error ? <p className="error-text">{state.error}</p> : null}

      <SubmitButton className="button button-primary" label="Create admin account" pendingLabel="Creating..." />
    </form>
  );
}
