import { PrismaClient } from "@prisma/client";

let prismaClient: PrismaClient | null = null;

export const createPrismaClient = () => {
  if (!prismaClient) {
    return new PrismaClient();
  }
};

export const getPrismaClient = (): PrismaClient => {
  if (!prismaClient) {
    prismaClient = new PrismaClient();
  }
  return prismaClient;
};
