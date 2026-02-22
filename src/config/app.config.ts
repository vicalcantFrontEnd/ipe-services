import { registerAs } from '@nestjs/config';
import { z } from 'zod';

const appConfigSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
  API_PREFIX: z.string().default('api'),
  API_VERSION: z.string().default('1'),
});

export type AppConfig = z.infer<typeof appConfigSchema>;

export default registerAs('app', (): AppConfig => {
  const config = appConfigSchema.parse(process.env);
  return config;
});
