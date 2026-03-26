import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminRegisterForm } from "@/components/admin-register-form";
import { getAdminUser } from "@/lib/auth";

export default async function AdminRegisterPage() {
  const admin = await getAdminUser();

  if (admin) {
    redirect("/admin/quizzes");
  }

  return (
    <main className="centered-page">
      <section className="auth-card stack-lg">
        <div className="stack-sm">
          <p className="eyebrow">Admin access</p>
          <h1>Create admin account</h1>
          <p className="muted-text">Create your admin account first, then use it to manage quizzes.</p>
        </div>
        <AdminRegisterForm />
        <p className="muted-text">
          Already have an account?{" "}
          <Link className="inline-link" href="/admin/login">
            Login here
          </Link>
        </p>
      </section>
    </main>
  );
}
