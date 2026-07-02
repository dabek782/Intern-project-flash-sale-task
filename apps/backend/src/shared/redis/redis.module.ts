import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';
import { REDIS_CLIENT } from './redis.constants';
import { RedisShutdownService } from './redis.shutdown.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService): Promise<RedisClientType> => {
        const redisUrl = configService.get<string>('REDIS_URL') ?? 'redis://localhost:6379';
        const redisClient = createClient({ url: redisUrl });

        redisClient.on('error', (error) => {
          console.error('Redis client error:', error);
        });

        await redisClient.connect();

        return redisClient;
      },
    },
    RedisShutdownService,
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}

  