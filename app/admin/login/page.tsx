import type { Metadata } from "next";

import { LoginForm } from "@/components/admin/login-form";
import styles from "./login.module.css";

export const metadata: Metadata = {
  title: "Admin Login | AI Navigation",
  description: "Sign in to the AI Navigation admin area.",
};

export default function AdminLoginPage() {
  return (
    <main className={styles.page}>
      <section aria-labelledby="login-title" className={styles.card}>
        <p className={styles.eyebrow}>AI Navigation</p>
        <h1 id="login-title">Sign in to the admin dashboard</h1>
        <p className={styles.intro}>
          Use your admin account to manage tools, categories, ads, and analytics.
        </p>
        <LoginForm />
      </section>
    </main>
  );
}
