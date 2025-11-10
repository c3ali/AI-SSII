import { PrismaClient } from '@prisma/client'

// Singleton pattern pour Prisma Client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Helper pour déconnecter proprement
export async function disconnectPrisma() {
  await prisma.$disconnect()
}

// Helper pour transactions
export async function transaction<T>(
  callback: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  return prisma.$transaction(async (tx) => callback(tx as PrismaClient))
}

export default prisma
