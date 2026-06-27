"use client";

import { useActionState } from "react";

import { loginAction, type LoginActionState } from "@/app/admin/actions";
import styles from "@/app/admin/login/login.module.css";

const initialState: LoginActionState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} aria-describedby="login-error" className={styles.form}>
      <label htmlFor="username">Admin username</label>
      <input
        autoComplete="username"
        disabled={pending}
        id="username"
        name="username"
        required
        type="text"
      />

      <label htmlFor="password">Password</label>
      <input
        autoComplete="current-password"
        disabled={pending}
        id="password"
        name="password"
        required
        type="password"
      />

      <p aria-live="polite" className={styles.error} id="login-error" role="status">
        {state.error}
      </p>

      <button disabled={pending} type="submit">
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
