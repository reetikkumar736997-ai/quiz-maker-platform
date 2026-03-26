import Link from "next/link";
import { logoutAction } from "@/app/actions";
import { requireAdminUser } from "@/lib/auth";

export default async function AdminDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const admin = await requireAdminUser();

  return (
    <div className="dashboard-shell">
      <aside className="sidebar stack-lg">
        <div className="stack-sm">
          <p className="eyebrow">Quiz Maker</p>
          <h2>Admin panel</h2>
          <p className="muted-text">{admin.email}</p>
        </div>

        <nav className="sidebar-nav stack-sm">
          <Link className="nav-link" href="/admin/quizzes">
            All quizzes
          </Link>
          <Link className="nav-link" href="/admin/quizzes/new">
            Create quiz
          </Link>
          <Link className="nav-link" href="/">
            Public home
          </Link>
        </nav>

        <form action={logoutAction}>
          <button className="button button-ghost" type="submit">
            Logout
          </button>
        </form>
      </aside>

      <main className="dashboard-main">{children}</main>
    </div>
  );
}
