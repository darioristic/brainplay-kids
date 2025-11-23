import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

let redisClient: ReturnType<typeof createClient> | null = null;

export async function getRedisClient() {
  if (redisClient) {
    return redisClient;
  }

  // For Vercel/Upstash Redis, use TLS if URL contains rediss://
  const isTLS = redisUrl.startsWith('rediss://');
  
  redisClient = createClient({
    url: redisUrl,
    socket: isTLS ? {
      tls: true,
      rejectUnauthorized: false, // Required for Upstash
    } : undefined,
  });

  redisClient.on('error', (err) => {
    console.error('Redis Client Error', err);
  });

  try {
    await redisClient.connect();
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    redisClient = null;
    throw error;
  }
  
  return redisClient;
}

export async function closeRedisClient() {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}

// Tenant cache utilities
export async function getTenantFromCache(subdomain: string) {
  const client = await getRedisClient();
  const key = `tenant:${subdomain}`;
  const data = await client.get(key);
  return data ? JSON.parse(data) : null;
}

export async function setTenantInCache(subdomain: string, data: any, ttl: number = 3600) {
  const client = await getRedisClient();
  const key = `tenant:${subdomain}`;
  await client.setEx(key, ttl, JSON.stringify(data));
}

export async function invalidateTenantCache(subdomain: string) {
  const client = await getRedisClient();
  const key = `tenant:${subdomain}`;
  await client.del(key);
}

