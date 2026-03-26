import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin-login-form";
import { getAdminUser } from "@/lib/auth";

export default async function AdminLoginPage() {
  const admin = await getAdminUser();

  if (admin) {
    redirect("/admin/quizzes");
  }

  return (
    <main className="centered-page">
      <section className="auth-card stack-lg">
        <div className="stack-sm">
          <p className="eyebrow">Admin access</p>
          <h1>Login to manage quizzes</h1>
          <p className="muted-text">Login with your admin account to create, publish, and review quizzes.</p>
        </div>
        <AdminLoginForm />
        <p className="muted-text">
          Need an account?{" "}
          <Link className="inline-link" href="/admin/register">
            Create admin account
          </Link>
        </p>
      </section>
    </main>
  );
}
