import { Inject, Injectable, OnApplicationShutdown } from '@nestjs/common';
import { RedisClientType } from 'redis';
import { REDIS_CLIENT } from './redis.constants';

@Injectable()
export class RedisShutdownService implements OnApplicationShutdown {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redisClient: RedisClientType,
  ) {}

  async onApplicationShutdown(): Promise<void> {
    if (this.redisClient.isOpen) {
      await this.redisClient.disconnect();
    }
  }
}

//redis.shutdown.service allows for gracefully shutting down redis