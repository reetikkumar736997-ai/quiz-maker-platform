const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@quizmaker.local";
  const name = process.env.ADMIN_NAME || "Quiz Admin";
  const password = process.env.ADMIN_PASSWORD || "admin123";

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.adminUser.upsert({
    where: { email },
    update: { name, passwordHash },
    create: { email, name, passwordHash },
  });

  const sampleSlug = "general-knowledge-demo";
  const existingQuiz = await prisma.quiz.findUnique({
    where: { slug: sampleSlug },
  });

  if (!existingQuiz) {
    await prisma.quiz.create({
      data: {
        title: "General Knowledge Demo",
        description: "A starter quiz seeded for quick testing.",
        slug: sampleSlug,
        status: "PUBLISHED",
        questions: {
          create: [
            {
              prompt: "What is the capital of France?",
              type: "MCQ_SINGLE",
              order: 1,
              explanation: "Paris is the capital and most populous city of France.",
              choices: {
                create: [
                  { text: "Paris", isCorrect: true, order: 1 },
                  { text: "Madrid", isCorrect: false, order: 2 },
                  { text: "Berlin", isCorrect: false, order: 3 },
                  { text: "Rome", isCorrect: false, order: 4 },
                ],
              },
            },
            {
              prompt: "Who wrote Hamlet?",
              type: "TEXT",
              order: 2,
              correctText: "William Shakespeare",
              explanation: "Hamlet is one of William Shakespeare's most famous tragedies.",
            },
          ],
        },
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
