import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class CacheService {
  private redis: Redis.Redis;
  private readonly logger = new Logger(CacheService.name);
  private cacheEnabled: boolean;

  constructor(private configService: ConfigService) {
    const redisHost = this.configService.get<string>('REDIS_HOST') || 'localhost';
    const redisPort = parseInt(this.configService.get<string>('REDIS_PORT') || '6379');
    this.cacheEnabled = this.configService.get<string>('REDIS_ENABLED') !== 'false';

    if (this.cacheEnabled) {
      try {
        this.redis = new Redis({
          host: redisHost,
          port: redisPort,
          retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
          },
        });

        this.redis.on('connect', () => {
          this.logger.log('Redis connected successfully');
        });

        this.redis.on('error', (err) => {
          this.logger.error('Redis connection error:', err);
          this.cacheEnabled = false;
        });
      } catch (error) {
        this.logger.warn('Redis not available, caching disabled');
        this.cacheEnabled = false;
      }
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.cacheEnabled || !this.redis) {
      return null;
    }

    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      this.logger.error(`Error getting cache key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    if (!this.cacheEnabled || !this.redis) {
      return;
    }

    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await this.redis.setex(key, ttl, serialized);
      } else {
        await this.redis.set(key, serialized);
      }
    } catch (error) {
      this.logger.error(`Error setting cache key ${key}:`, error);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.cacheEnabled || !this.redis) {
      return;
    }

    try {
      await this.redis.del(key);
    } catch (error) {
      this.logger.error(`Error deleting cache key ${key}:`, error);
    }
  }

  async delPattern(pattern: string): Promise<void> {
    if (!this.cacheEnabled || !this.redis) {
      return;
    }

    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      this.logger.error(`Error deleting cache pattern ${pattern}:`, error);
    }
  }

  async invalidate(pattern: string): Promise<void> {
    await this.delPattern(pattern);
  }
}

