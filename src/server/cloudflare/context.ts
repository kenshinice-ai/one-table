import { getCloudflareContext } from '@opennextjs/cloudflare';
import { z } from 'zod';

const runtimeEnvSchema = z.object({
  APP_ENV: z.enum(['development', 'staging', 'production', 'test']),
  APP_BASE_URL: z.url(),
  DB: z.custom<D1Database>((value) => Boolean(value)).optional(),
  MEDIA_BUCKET: z.custom<R2Bucket>((value) => Boolean(value)).optional(),
});

export type RuntimeEnv = z.infer<typeof runtimeEnvSchema>;

export async function getRuntimeEnv(): Promise<RuntimeEnv> {
  const { env } = await getCloudflareContext({ async: true });
  return runtimeEnvSchema.parse(env);
}
