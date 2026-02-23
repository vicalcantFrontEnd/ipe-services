import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { RedisService } from '@database/redis/redis.service';

const KEY_PREFIX = 'auth:blacklist:';

@Injectable()
export class TokenBlacklistService {
  constructor(private readonly redis: RedisService) {}

  async blacklistToken(token: string, ttlSeconds: number): Promise<void> {
    if (ttlSeconds <= 0) return;
    const key = this.getKey(token);
    await this.redis.set(key, '1', ttlSeconds);
  }

  async isBlacklisted(token: string): Promise<boolean> {
    const key = this.getKey(token);
    return this.redis.exists(key);
  }

  private getKey(token: string): string {
    const hash = createHash('sha256').update(token).digest('hex');
    return `${KEY_PREFIX}${hash}`;
  }
}
