import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // ============================================
  // USERS
  // ============================================
  console.log('Creating users...');

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@ssii.com' },
    update: {},
    create: {
      email: 'admin@ssii.com',
      password: await bcrypt.hash('admin123', 10),
      name: 'Admin SSII',
      role: 'ADMIN',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    },
  });

  const testUser = await prisma.user.upsert({
    where: { email: 'test@ssii.com' },
    update: {},
    create: {
      email: 'test@ssii.com',
      password: await bcrypt.hash('test123', 10),
      name: 'Test User',
      role: 'USER',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test',
    },
  });

  const developerUser = await prisma.user.upsert({
    where: { email: 'dev@ssii.com' },
    update: {},
    create: {
      email: 'dev@ssii.com',
      password: await bcrypt.hash('dev123', 10),
      name: 'Developer User',
      role: 'DEVELOPER',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dev',
    },
  });

  console.log('✅ Users created');

  // ============================================
  // PROJECTS
  // ============================================
  console.log('Creating projects...');

  const ecommerceProject = await prisma.project.create({
    data: {
      name: 'E-commerce Platform',
      brief:
        'Créer une plateforme e-commerce moderne avec paiement Stripe, gestion des stocks, et interface admin complète',
      status: 'SUCCESS',
      userId: testUser.id,
      stack: 'NEXTJS',
      budget: 100,
      timeline: 14,
      githubUrl: 'https://github.com/ssii/ecommerce-platform',
      deployUrl: 'https://ecommerce-platform.vercel.app',
      plan: {
        title: 'E-commerce Platform',
        objectives: [
          'Permettre la vente de produits en ligne',
          'Gérer les stocks et inventaires',
          'Intégrer les paiements sécurisés',
          'Fournir un dashboard admin',
        ],
        userStories: [
          'En tant que client, je peux parcourir le catalogue',
          'En tant que client, je peux ajouter des produits au panier',
          'En tant que client, je peux payer en ligne',
          'En tant qu\'admin, je peux gérer les produits',
        ],
        techStack: ['Next.js 14', 'Tailwind CSS', 'Stripe', 'PostgreSQL'],
      },
      architecture: {
        structure: 'monorepo',
        frontend: 'Next.js with App Router',
        backend: 'Next.js API Routes',
        database: 'PostgreSQL with Prisma',
        deployment: 'Vercel',
      },
      startedAt: new Date('2024-01-15'),
      completedAt: new Date('2024-01-29'),
    },
  });

  await prisma.metrics.create({
    data: {
      projectId: ecommerceProject.id,
      coverage: 92.5,
      complexity: 8.2,
      linesOfCode: 15420,
      testsPassed: 156,
      testsTotal: 169,
      lighthouse: 96,
      bundleSize: 245.8,
      loadTime: 1240,
      owaspScore: 9.2,
      vulnerabilities: 0,
      estimatedCost: 25.5,
      apiTokensUsed: 125000,
    },
  });

  const saasProject = await prisma.project.create({
    data: {
      name: 'SaaS Dashboard',
      brief:
        'Application SaaS avec authentification, billing Stripe, analytics et multi-tenancy',
      status: 'RUNNING',
      userId: testUser.id,
      stack: 'NEXTJS',
      budget: 150,
      timeline: 21,
      plan: {
        title: 'SaaS Dashboard',
        objectives: [
          'Créer un système d\'authentification robuste',
          'Implémenter le billing récurrent',
          'Développer des analytics en temps réel',
          'Supporter le multi-tenancy',
        ],
      },
      startedAt: new Date(),
    },
  });

  const mobileProject = await prisma.project.create({
    data: {
      name: 'Fitness Tracker App',
      brief: 'Application mobile de suivi fitness avec React Native et Expo',
      status: 'DRAFT',
      userId: developerUser.id,
      stack: 'EXPO',
      budget: 75,
      timeline: 10,
    },
  });

  console.log('✅ Projects created');

  // ============================================
  // EXECUTIONS
  // ============================================
  console.log('Creating executions...');

  // Executions for E-commerce project
  await prisma.execution.createMany({
    data: [
      {
        projectId: ecommerceProject.id,
        userId: testUser.id,
        agent: 'DIRECTOR',
        status: 'SUCCESS',
        progress: 100,
        input: { brief: ecommerceProject.brief },
        output: ecommerceProject.plan,
        duration: 12500,
        tokensUsed: 8500,
        cost: 0.17,
        startedAt: new Date('2024-01-15T10:00:00'),
        completedAt: new Date('2024-01-15T10:12:30'),
      },
      {
        projectId: ecommerceProject.id,
        userId: testUser.id,
        agent: 'ARCHITECT',
        status: 'SUCCESS',
        progress: 100,
        input: { plan: ecommerceProject.plan },
        output: ecommerceProject.architecture,
        duration: 18200,
        tokensUsed: 12300,
        cost: 0.25,
        startedAt: new Date('2024-01-15T10:15:00'),
        completedAt: new Date('2024-01-15T10:33:12'),
      },
      {
        projectId: ecommerceProject.id,
        userId: testUser.id,
        agent: 'DEVELOPER',
        status: 'SUCCESS',
        progress: 100,
        input: { architecture: ecommerceProject.architecture },
        output: { filesGenerated: 87, linesOfCode: 15420 },
        duration: 245000,
        tokensUsed: 95000,
        cost: 1.9,
        startedAt: new Date('2024-01-15T11:00:00'),
        completedAt: new Date('2024-01-15T15:05:00'),
      },
      {
        projectId: ecommerceProject.id,
        userId: testUser.id,
        agent: 'SECURITY',
        status: 'SUCCESS',
        progress: 100,
        input: { codebase: 'analysis' },
        output: { vulnerabilities: 0, owaspScore: 9.2 },
        duration: 32000,
        tokensUsed: 15000,
        cost: 0.3,
        startedAt: new Date('2024-01-16T09:00:00'),
        completedAt: new Date('2024-01-16T09:32:00'),
      },
      {
        projectId: ecommerceProject.id,
        userId: testUser.id,
        agent: 'QA',
        status: 'SUCCESS',
        progress: 100,
        input: { codebase: 'testing' },
        output: { testsPassed: 156, testsTotal: 169, coverage: 92.5 },
        duration: 125000,
        tokensUsed: 28000,
        cost: 0.56,
        startedAt: new Date('2024-01-17T10:00:00'),
        completedAt: new Date('2024-01-17T12:05:00'),
      },
      {
        projectId: ecommerceProject.id,
        userId: testUser.id,
        agent: 'DEVOPS',
        status: 'SUCCESS',
        progress: 100,
        input: { codebase: 'deployment' },
        output: {
          deployUrl: 'https://ecommerce-platform.vercel.app',
          cicd: 'configured',
        },
        duration: 45000,
        tokensUsed: 8500,
        cost: 0.17,
        startedAt: new Date('2024-01-18T14:00:00'),
        completedAt: new Date('2024-01-18T14:45:00'),
      },
    ],
  });

  // Executions for SaaS project (in progress)
  await prisma.execution.createMany({
    data: [
      {
        projectId: saasProject.id,
        userId: testUser.id,
        agent: 'DIRECTOR',
        status: 'SUCCESS',
        progress: 100,
        input: { brief: saasProject.brief },
        output: saasProject.plan,
        duration: 15000,
        tokensUsed: 9500,
        cost: 0.19,
        startedAt: new Date(),
        completedAt: new Date(),
      },
      {
        projectId: saasProject.id,
        userId: testUser.id,
        agent: 'ARCHITECT',
        status: 'RUNNING',
        progress: 65,
        input: { plan: saasProject.plan },
        logs: [
          { timestamp: new Date(), level: 'info', message: 'Analyzing requirements' },
          { timestamp: new Date(), level: 'info', message: 'Designing architecture' },
        ],
        startedAt: new Date(),
      },
    ],
  });

  console.log('✅ Executions created');

  // ============================================
  // TEMPLATES
  // ============================================
  console.log('Creating templates...');

  await prisma.template.createMany({
    data: [
      {
        name: 'SaaS Starter',
        description:
          'Template complet pour une application SaaS avec auth, billing, et dashboard',
        category: 'SAAS',
        brief:
          'Application SaaS avec authentification NextAuth, billing Stripe, analytics et multi-tenancy',
        config: {
          features: ['auth', 'billing', 'analytics', 'multi-tenancy'],
          integrations: ['stripe', 'resend', 'vercel'],
        },
        stack: 'NEXTJS',
        usageCount: 42,
        rating: 4.8,
      },
      {
        name: 'E-commerce Storefront',
        description: 'Template pour boutique en ligne avec panier et paiement',
        category: 'ECOMMERCE',
        brief:
          'Boutique en ligne avec catalogue produits, panier, checkout Stripe et gestion commandes',
        config: {
          features: ['catalog', 'cart', 'checkout', 'orders'],
          integrations: ['stripe', 'cloudinary'],
        },
        stack: 'NEXTJS',
        usageCount: 38,
        rating: 4.6,
      },
      {
        name: 'Landing Page',
        description: 'Page d\'atterrissage optimisée pour la conversion',
        category: 'LANDING',
        brief: 'Landing page moderne avec hero section, features, pricing et CTA',
        config: {
          features: ['hero', 'features', 'pricing', 'cta', 'testimonials'],
        },
        stack: 'NEXTJS',
        usageCount: 156,
        rating: 4.9,
      },
      {
        name: 'Admin Dashboard',
        description: 'Dashboard admin avec tables, charts et gestion utilisateurs',
        category: 'DASHBOARD',
        brief:
          'Dashboard admin complet avec tables de données, graphiques, gestion utilisateurs et rôles',
        config: {
          features: ['tables', 'charts', 'users', 'roles', 'settings'],
          integrations: ['recharts'],
        },
        stack: 'NEXTJS',
        usageCount: 67,
        rating: 4.7,
      },
      {
        name: 'Mobile App Starter',
        description: 'Application mobile React Native avec navigation',
        category: 'MOBILE',
        brief: 'App mobile avec navigation, authentification et état global',
        config: {
          features: ['navigation', 'auth', 'state-management'],
        },
        stack: 'REACT_NATIVE',
        usageCount: 29,
        rating: 4.5,
      },
      {
        name: 'REST API',
        description: 'API REST avec authentification JWT et documentation Swagger',
        category: 'API',
        brief:
          'API REST complète avec auth JWT, validation, rate limiting et documentation',
        config: {
          features: ['auth', 'validation', 'rate-limiting', 'swagger'],
        },
        stack: 'NEXTJS',
        usageCount: 51,
        rating: 4.6,
      },
    ],
  });

  console.log('✅ Templates created');

  // ============================================
  // COMMENTS
  // ============================================
  console.log('Creating comments...');

  await prisma.comment.createMany({
    data: [
      {
        content: 'Excellent travail ! Le design est très réussi.',
        projectId: ecommerceProject.id,
        userId: adminUser.id,
      },
      {
        content: 'Les performances sont impressionnantes, score Lighthouse de 96 !',
        projectId: ecommerceProject.id,
        userId: developerUser.id,
      },
      {
        content: 'Quelques suggestions pour améliorer l\'UX du checkout.',
        projectId: ecommerceProject.id,
        userId: testUser.id,
      },
    ],
  });

  console.log('✅ Comments created');

  // ============================================
  // FILES
  // ============================================
  console.log('Creating files...');

  await prisma.file.createMany({
    data: [
      {
        filename: 'brief.pdf',
        mimetype: 'application/pdf',
        size: 245678,
        url: 'https://storage.ssii.com/files/brief-123.pdf',
        projectId: ecommerceProject.id,
      },
      {
        filename: 'mockups.fig',
        mimetype: 'application/figma',
        size: 1847563,
        url: 'https://www.figma.com/file/abc123',
        projectId: ecommerceProject.id,
      },
    ],
  });

  console.log('✅ Files created');

  // ============================================
  // SUMMARY
  // ============================================
  console.log('\n🎉 Seeding completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`   - Users: 3 (admin, test, developer)`);
  console.log(`   - Projects: 3 (1 success, 1 running, 1 draft)`);
  console.log(`   - Executions: 8`);
  console.log(`   - Templates: 6`);
  console.log(`   - Comments: 3`);
  console.log(`   - Files: 2`);
  console.log('\n🔐 Credentials:');
  console.log(`   Admin: admin@ssii.com / admin123`);
  console.log(`   Test: test@ssii.com / test123`);
  console.log(`   Dev: dev@ssii.com / dev123\n`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
