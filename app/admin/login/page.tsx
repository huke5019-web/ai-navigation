import type { Metadata } from "next";

import { LoginForm } from "@/components/admin/login-form";
import styles from "./login.module.css";

export const metadata: Metadata = {
  title: "管理员登录 | AI 导航",
  description: "登录 AI 导航管理后台",
};

export default function AdminLoginPage() {
  return (
    <main className={styles.page}>
      <section aria-labelledby="login-title" className={styles.card}>
        <p className={styles.eyebrow}>AI 导航</p>
        <h1 id="login-title">登录管理后台</h1>
        <p className={styles.intro}>使用管理员账号维护工具、分类与广告内容。</p>
        <LoginForm />
      </section>
    </main>
  );
}
