import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: PrismaClient,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const connectionString = configService.get<string>('DATABASE_URL') ?? '';
        return new PrismaClient({
          adapter: new PrismaPg({ connectionString }),
        });
      },
    },
  ],
  exports: [PrismaClient],
})
export class PrismaModule {}
