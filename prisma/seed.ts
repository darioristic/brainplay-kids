import { PrismaClient, GameCategory, Difficulty, AgeGroup } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Helper functions for hashing (since we can't import from lib in seed)
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function hashPIN(pin: string): Promise<string> {
  return bcrypt.hash(pin, 8);
}

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // 1. Create Admin User
  console.log('Creating admin user...');
  const adminEmail = 'admin@brainplaykids.com';
  const adminPassword = await hashPassword('admin123');
  
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
    create: {
      email: adminEmail,
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });
  console.log(`✓ Admin user created: ${adminEmail} / admin123`);

  // 2. Create Test Tenant and Family
  console.log('Creating test tenant and family...');
  const testSubdomain = 'test-family';
  const testTenant = await prisma.tenant.upsert({
    where: { subdomain: testSubdomain },
    update: {
      name: 'Test Family',
      active: true,
    },
    create: {
      subdomain: testSubdomain,
      name: 'Test Family',
      active: true,
      emoji: '🏠',
    },
  });

  // 3. Create Test Parent User
  console.log('Creating test parent user...');
  const parentEmail = 'parent@test.com';
  const parentPassword = await hashPassword('parent123');
  
  const parentUser = await prisma.user.upsert({
    where: { email: parentEmail },
    update: {
      password: parentPassword,
      name: 'Test Parent',
      role: 'PARENT',
    },
    create: {
      email: parentEmail,
      password: parentPassword,
      name: 'Test Parent',
      role: 'PARENT',
    },
  });

  // 4. Create Family
  const testFamily = await prisma.family.upsert({
    where: {
      tenantId_userId: {
        tenantId: testTenant.id,
        userId: parentUser.id,
      },
    },
    update: {
      name: 'Test Family',
    },
    create: {
      tenantId: testTenant.id,
      userId: parentUser.id,
      name: 'Test Family',
    },
  });
  console.log(`✓ Test family created: ${testSubdomain}.brainplaykids.com`);
  console.log(`✓ Parent user created: ${parentEmail} / parent123`);

  // 5. Create Test Child
  console.log('Creating test child...');
  const childPIN = await hashPIN('1234');
  const testChild = await prisma.child.upsert({
    where: {
      id: 'test-child-1',
    },
    update: {
      name: 'Test Child',
      age: 7,
      pin: childPIN,
      avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=TestChild',
      buddy: AgeGroup.DISCOVERY,
      preferredDifficulty: Difficulty.Medium,
      themePreference: AgeGroup.DISCOVERY,
    },
    create: {
      id: 'test-child-1',
      familyId: testFamily.id,
      name: 'Test Child',
      age: 7,
      pin: childPIN,
      avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=TestChild',
      buddy: AgeGroup.DISCOVERY,
      preferredDifficulty: Difficulty.Medium,
      themePreference: AgeGroup.DISCOVERY,
      points: 0,
    },
  });
  console.log(`✓ Test child created: Test Child / PIN: 1234`);

  // 6. Seed Game Modules
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

  console.log(`✓ Seeded ${gameModules.length} game modules`);

  console.log('\n=== Seed Summary ===');
  console.log('Admin User:');
  console.log(`  Email: ${adminEmail}`);
  console.log(`  Password: admin123`);
  console.log('\nTest Parent User:');
  console.log(`  Email: ${parentEmail}`);
  console.log(`  Password: parent123`);
  console.log(`  Subdomain: ${testSubdomain}.brainplaykids.com`);
  console.log('\nTest Child:');
  console.log(`  Name: ${testChild.name}`);
  console.log(`  PIN: 1234`);
  console.log('\n✅ Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
