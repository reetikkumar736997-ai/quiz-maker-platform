# Quiz Maker Platform

Full-stack quiz platform built with Next.js, Prisma, PostgreSQL, and Vercel.

Admins can create quizzes, publish shareable links, review submissions, and manage results from a protected dashboard. Participants can open the public link, enter their name, attempt timed quizzes, and see instant results with explanations.

## Live Demo

- Live app: [https://quiz-maker-app-five.vercel.app](https://quiz-maker-app-five.vercel.app)
- Admin register: [https://quiz-maker-app-five.vercel.app/admin/register](https://quiz-maker-app-five.vercel.app/admin/register)
- Admin login: [https://quiz-maker-app-five.vercel.app/admin/login](https://quiz-maker-app-five.vercel.app/admin/login)

## Features

- Admin registration, login, logout, and protected dashboard
- Quiz create, edit, publish, and public share links
- MCQ and text-answer question support
- Optional quiz timer with auto-submit
- Instant result page with answer review and explanations
- Admin results dashboard with score, submission time, and time taken
- Submission and quiz delete flow with custom in-app confirmation modal
- Responsive UI with dark mode

## Tech Stack

- Next.js 16
- React 19
- Prisma ORM
- PostgreSQL (Neon)
- Vercel
- Zod
- bcryptjs

## Local Setup

1. Copy env file:

```bash
copy .env.example .env
```

2. Add your PostgreSQL `DATABASE_URL` and `SESSION_SECRET` in `.env`

3. Install dependencies:

```bash
cmd /d /s /c npm.cmd install
```

4. Push schema:

```bash
cmd /d /s /c npm.cmd run db:push
```

5. Start development server:

```bash
cmd /d /s /c npm.cmd run dev
```

## Environment Variables

Create a `.env` file with:

```env
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"
SESSION_SECRET="your-strong-session-secret"
```

## Production Deploy

1. Create a PostgreSQL database on Neon
2. Add `DATABASE_URL` and `SESSION_SECRET` in Vercel environment variables
3. Push the schema:

```bash
cmd /d /s /c npm.cmd run db:deploy
```

4. Deploy to Vercel
5. Open `/admin/register` on the live site and create the first admin account

## Main Workflows

### Admin

- Register admin account
- Login to dashboard
- Create quiz
- Add questions and explanations
- Set optional timer
- Publish and share quiz link
- Review results and submission details

### Participant

- Open public quiz link
- Enter name
- Attempt quiz
- Submit manually or auto-submit on timer end
- View score and explanations

## Resume Summary

Built and deployed a full-stack Quiz Maker Platform using Next.js, Prisma, PostgreSQL, and Vercel with admin authentication, quiz publishing, timed quiz attempts, auto-submission, answer review, and an admin analytics/results dashboard.
