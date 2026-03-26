# Quiz Maker

Next.js fullstack quiz maker with:

- admin login
- quiz create/edit/publish
- public share links
- attempt scoring with solutions
- admin results dashboard

## Setup

```bash
copy .env.example .env
cmd /d /s /c npm.cmd install
cmd /d /s /c npm.cmd run db:push
cmd /d /s /c npm.cmd run dev
```

## Production Deploy

This project uses PostgreSQL. Neon works well for both local and production use.

1. Create a Neon database and copy the `DATABASE_URL`
2. Set `DATABASE_URL` and `SESSION_SECRET` in Vercel
3. Run the schema push against production:

```bash
cmd /d /s /c npm.cmd run db:deploy
```

4. Deploy the app to Vercel
5. Open `/admin/register` on the live site and create the first admin account
