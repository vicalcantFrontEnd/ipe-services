import { registerAs } from '@nestjs/config';
import { z } from 'zod';

const redisConfigSchema = z.object({
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.coerce.number().int().min(0).default(0),
});

export type RedisConfig = z.infer<typeof redisConfigSchema>;

export default registerAs('redis', (): RedisConfig => {
  const config = redisConfigSchema.parse(process.env);
  return config;
});
