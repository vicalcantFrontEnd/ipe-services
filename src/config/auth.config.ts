import { registerAs } from '@nestjs/config';
import { z } from 'zod';

const authConfigSchema = z.object({
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRATION: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_REFRESH_EXPIRATION: z.string().default('7d'),
});

export type AuthConfig = z.infer<typeof authConfigSchema>;

export default registerAs('auth', (): AuthConfig => {
  const config = authConfigSchema.parse(process.env);
  return config;
});
