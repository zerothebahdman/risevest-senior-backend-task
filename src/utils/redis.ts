import Redis from 'ioredis';

export default class RedisClient {
  private client: Redis;
  constructor(redisUrl: string) {
    this.client = new Redis(redisUrl);
    this.client.expire('article', 30);
  }

  async set(key: string, value: string): Promise<string> {
    return await this.client.set(key, value);
  }

  async get(key: string): Promise<string | null> {
    const socket = await this.client.get(key);
    if (socket) {
      return socket;
    }
    return null;
  }

  async delete(key: string): Promise<number> {
    return await this.client.del(key);
  }

  async exists(key: string): Promise<number> {
    return await this.client.exists(key);
  }

  async quit(): Promise<void> {
    await this.client.quit();
  }
}
