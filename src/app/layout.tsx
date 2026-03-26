import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "Quiz Maker",
  description: "Create quizzes, share links, and review attempts from one dashboard.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const cookieTheme = cookieStore.get("quiz-maker-theme")?.value;
  const initialTheme = cookieTheme === "light" || cookieTheme === "dark" ? cookieTheme : "dark";

  return (
    <html
      lang="en"
      data-theme={initialTheme}
      style={{ colorScheme: initialTheme }}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <ThemeToggle initialTheme={initialTheme} />
        {children}
      </body>
    </html>
  );
}
