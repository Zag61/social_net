import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class PresenceService {
  private readonly logger = new Logger(PresenceService.name);
  private readonly redis: Redis;
  private readonly TTL = 90; // seconds

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL as string);
    this.redis.on('connect', () => {
      this.logger.log('Redis connected successfully');
    });

    this.redis.on('ready', () => {
      this.logger.log('Redis is ready to receive commands');
    });

    this.redis.on('error', (err) => {
      this.logger.error('Redis Error: ', err);
    });
  }

  private countKey(userId: string) { return `presence:count:${userId}`; }
  private lastKey(userId: string) { return `presence:last:${userId}`; }

  async markConnected(userId: string): Promise<number> {
  const key = this.countKey(userId);
  const pipeline = this.redis.pipeline();
  pipeline.incr(key);
  pipeline.expire(key, this.TTL);
  const res = await pipeline.exec();
  return Number(res?.[0]?.[1] ?? 0);
}


  async refreshHeartbeat(userId: string): Promise<void> {
    await this.redis.expire(this.countKey(userId), this.TTL);
  }

  async markDisconnected(userId: string): Promise<boolean> {
    const key = this.countKey(userId);
    const newCount = await this.redis.decr(key);
    if (newCount <= 0) {
      await this.redis.del(key);
      // store last seen
      await this.redis.set(this.lastKey(userId), new Date().toISOString());
      return true; // became offline
    }
    return false; // still online
  }

  async isOnline(userId: string): Promise<boolean> {
    const v = await this.redis.get(this.countKey(userId));
    return v !== null && parseInt(v, 10) > 0;
  }

  // Batch check
  async getOnlineMap(userIds: string[]): Promise<Record<string, boolean>> {
    if (!userIds.length) return {};
    const keys = userIds.map(id => this.countKey(id));
    const vals = await this.redis.mget(...keys);
    const out: Record<string, boolean> = {};
    for (let i = 0; i < userIds.length; i++) {
      out[userIds[i]] = vals[i] !== null && parseInt(vals[i]!, 10) > 0;
    }
    return out;
  }
}
