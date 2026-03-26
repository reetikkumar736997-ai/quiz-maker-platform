const fs = require("node:fs");
const path = require("node:path");
const { DatabaseSync } = require("node:sqlite");

function getDatabaseFile() {
  const rawUrl = process.env.DATABASE_URL || "file:./dev.db";

  if (!rawUrl.startsWith("file:")) {
    throw new Error("Only sqlite file DATABASE_URL values are supported.");
  }

  const filePath = rawUrl.slice(5);

  if (/^[A-Za-z]:\//.test(filePath)) {
    return filePath;
  }

  return path.resolve(process.cwd(), filePath);
}

const dbFile = getDatabaseFile();
fs.mkdirSync(path.dirname(dbFile), { recursive: true });

const db = new DatabaseSync(dbFile);
db.exec("PRAGMA foreign_keys = ON;");

const quizColumns = db.prepare(`PRAGMA table_info("Quiz")`).all();
const hasDurationMinutes = quizColumns.some((column) => column.name === "durationMinutes");
const attemptColumns = db.prepare(`PRAGMA table_info("Attempt")`).all();
const hasElapsedSeconds = attemptColumns.some((column) => column.name === "elapsedSeconds");

db.exec(`
  CREATE TABLE IF NOT EXISTS "AdminUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE UNIQUE INDEX IF NOT EXISTS "AdminUser_email_key" ON "AdminUser"("email");

  CREATE TABLE IF NOT EXISTS "Quiz" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "durationMinutes" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE UNIQUE INDEX IF NOT EXISTS "Quiz_slug_key" ON "Quiz"("slug");

  CREATE TABLE IF NOT EXISTS "Question" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quizId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "explanation" TEXT,
    "correctText" TEXT,
    CONSTRAINT "Question_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );

  CREATE TABLE IF NOT EXISTS "Choice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "questionId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,
    CONSTRAINT "Choice_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );

  CREATE TABLE IF NOT EXISTS "Attempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quizId" TEXT NOT NULL,
    "participantName" TEXT NOT NULL,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "elapsedSeconds" INTEGER,
    "totalScore" INTEGER NOT NULL,
    "totalQuestions" INTEGER NOT NULL,
    CONSTRAINT "Attempt_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );

  CREATE TABLE IF NOT EXISTS "AttemptAnswer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedChoiceId" TEXT,
    "textAnswer" TEXT,
    "isCorrect" BOOLEAN NOT NULL,
    "awardedScore" INTEGER NOT NULL,
    CONSTRAINT "AttemptAnswer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "Attempt" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AttemptAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AttemptAnswer_selectedChoiceId_fkey" FOREIGN KEY ("selectedChoiceId") REFERENCES "Choice" ("id") ON DELETE SET NULL ON UPDATE CASCADE
  );

  CREATE INDEX IF NOT EXISTS "Question_quizId_idx" ON "Question"("quizId");
  CREATE INDEX IF NOT EXISTS "Choice_questionId_idx" ON "Choice"("questionId");
  CREATE INDEX IF NOT EXISTS "Attempt_quizId_idx" ON "Attempt"("quizId");
  CREATE INDEX IF NOT EXISTS "AttemptAnswer_attemptId_idx" ON "AttemptAnswer"("attemptId");
  CREATE INDEX IF NOT EXISTS "AttemptAnswer_questionId_idx" ON "AttemptAnswer"("questionId");
  CREATE INDEX IF NOT EXISTS "AttemptAnswer_selectedChoiceId_idx" ON "AttemptAnswer"("selectedChoiceId");

  CREATE TRIGGER IF NOT EXISTS "Quiz_updatedAt_trigger"
  AFTER UPDATE ON "Quiz"
  FOR EACH ROW
  BEGIN
    UPDATE "Quiz" SET "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = OLD."id";
  END;
`);

if (!hasDurationMinutes) {
  db.exec(`ALTER TABLE "Quiz" ADD COLUMN "durationMinutes" INTEGER;`);
}

if (!hasElapsedSeconds) {
  db.exec(`ALTER TABLE "Attempt" ADD COLUMN "elapsedSeconds" INTEGER;`);
}

db.close();
console.log(`Database initialized at ${dbFile}`);
