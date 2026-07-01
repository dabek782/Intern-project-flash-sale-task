import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();
if (!configService.get<string>('DATABASE_URL')) {
  throw new Error('DATABASE_URL is not defined');
}
const connectionString = `${configService.get<string>('DATABASE_URL')}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };
