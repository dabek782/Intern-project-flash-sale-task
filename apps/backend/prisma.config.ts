import 'dotenv/config';
import { defineConfig } from 'prisma/config';
import { ConfigService } from '@nestjs/config';
export default defineConfig({
  schema: 'prisma/schemas',
  migrations: {
    path: 'prisma/migrations',
    seed:'prisma/seed.ts'
  },
  datasource: {
    url: new ConfigService().get<string>('DATABASE_URL'),
  },
});
