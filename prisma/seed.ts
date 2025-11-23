import { PrismaClient, GameCategory, Difficulty } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding game modules...');

  const gameModules = [
    // MATH category
    {
      title: 'Number Ninja',
      description: 'Master addition and subtraction!',
      category: GameCategory.MATH,
      difficulty: Difficulty.Easy,
      minAge: 4,
      rewardPoints: 50,
      locked: false,
    },
    {
      title: 'Math Master',
      description: 'Solve multiplication and division problems!',
      category: GameCategory.MATH,
      difficulty: Difficulty.Medium,
      minAge: 5,
      rewardPoints: 75,
      locked: false,
    },
    {
      title: 'Algebra Adventure',
      description: 'Explore basic algebra and equations!',
      category: GameCategory.MATH,
      difficulty: Difficulty.Hard,
      minAge: 7,
      rewardPoints: 100,
      locked: false,
    },
    // LOGIC category
    {
      title: 'Pattern Puzzle',
      description: 'Complete the sequence of shapes.',
      category: GameCategory.LOGIC,
      difficulty: Difficulty.Easy,
      minAge: 4,
      rewardPoints: 50,
      locked: false,
    },
    {
      title: 'Logic Quest',
      description: 'Solve logical reasoning challenges!',
      category: GameCategory.LOGIC,
      difficulty: Difficulty.Medium,
      minAge: 5,
      rewardPoints: 75,
      locked: false,
    },
    {
      title: 'Critical Thinking',
      description: 'Advanced logic and problem-solving!',
      category: GameCategory.LOGIC,
      difficulty: Difficulty.Hard,
      minAge: 7,
      rewardPoints: 100,
      locked: false,
    },
    // MEMORY category
    {
      title: 'Card Flip',
      description: 'Remember where the animals are hiding.',
      category: GameCategory.MEMORY,
      difficulty: Difficulty.Easy,
      minAge: 4,
      rewardPoints: 50,
      locked: false,
    },
    {
      title: 'Memory Match',
      description: 'Match pairs and improve your memory!',
      category: GameCategory.MEMORY,
      difficulty: Difficulty.Medium,
      minAge: 5,
      rewardPoints: 75,
      locked: false,
    },
    {
      title: 'Memory Master',
      description: 'Advanced memory challenges!',
      category: GameCategory.MEMORY,
      difficulty: Difficulty.Hard,
      minAge: 6,
      rewardPoints: 100,
      locked: false,
    },
    // CREATIVITY category
    {
      title: 'Story Builder',
      description: 'Create your own adventure story.',
      category: GameCategory.CREATIVITY,
      difficulty: Difficulty.Easy,
      minAge: 5,
      rewardPoints: 60,
      locked: false,
    },
    {
      title: 'Creative Challenge',
      description: 'Express your creativity through art and stories!',
      category: GameCategory.CREATIVITY,
      difficulty: Difficulty.Medium,
      minAge: 6,
      rewardPoints: 80,
      locked: false,
    },
    {
      title: 'Innovation Lab',
      description: 'Advanced creative thinking and innovation!',
      category: GameCategory.CREATIVITY,
      difficulty: Difficulty.Hard,
      minAge: 8,
      rewardPoints: 120,
      locked: false,
    },
    // LANGUAGE category
    {
      title: 'Word Wizard',
      description: 'Find the missing letters.',
      category: GameCategory.LANGUAGE,
      difficulty: Difficulty.Easy,
      minAge: 4,
      rewardPoints: 50,
      locked: false,
    },
    {
      title: 'Vocabulary Builder',
      description: 'Learn new words and expand your vocabulary!',
      category: GameCategory.LANGUAGE,
      difficulty: Difficulty.Medium,
      minAge: 5,
      rewardPoints: 75,
      locked: false,
    },
    {
      title: 'Grammar Guru',
      description: 'Master grammar rules and sentence structure!',
      category: GameCategory.LANGUAGE,
      difficulty: Difficulty.Hard,
      minAge: 7,
      rewardPoints: 100,
      locked: false,
    },
  ];

  // Create or update each module
  for (const module of gameModules) {
    const existing = await prisma.gameModule.findFirst({
      where: {
        title: module.title,
        category: module.category,
        difficulty: module.difficulty,
      },
    });

    if (existing) {
      await prisma.gameModule.update({
        where: { id: existing.id },
        data: {
          description: module.description,
          minAge: module.minAge,
          rewardPoints: module.rewardPoints,
          locked: module.locked,
        },
      });
    } else {
      await prisma.gameModule.create({
        data: module,
      });
    }
  }

  console.log(`Seeded ${gameModules.length} game modules`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
