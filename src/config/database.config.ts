import { registerAs } from '@nestjs/config';
import { z } from 'zod';

const databaseConfigSchema = z.object({
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url().optional(),
});

export type DatabaseConfig = z.infer<typeof databaseConfigSchema>;

export default registerAs('database', (): DatabaseConfig => {
  const config = databaseConfigSchema.parse(process.env);
  return config;
});
