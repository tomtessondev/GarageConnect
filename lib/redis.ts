import { Redis } from 'ioredis';

// Client Redis pour la production
let redis: Redis | null = null;

if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL);
  
  redis.on('error', (err) => {
    console.error('Redis error:', err);
  });

  redis.on('connect', () => {
    console.log('✅ Redis connected');
  });
}

// Fallback en mémoire pour le développement
const memoryStore = new Map<string, string>();

export async function setSession(key: string, value: any, ttl: number = 3600) {
  const data = JSON.stringify(value);
  
  if (redis) {
    await redis.setex(key, ttl, data);
  } else {
    memoryStore.set(key, data);
    // Simuler l'expiration en mémoire
    setTimeout(() => memoryStore.delete(key), ttl * 1000);
  }
}

export async function getSession(key: string): Promise<any | null> {
  let data: string | null;
  
  if (redis) {
    data = await redis.get(key);
  } else {
    data = memoryStore.get(key) || null;
  }
  
  return data ? JSON.parse(data) : null;
}

export async function deleteSession(key: string) {
  if (redis) {
    await redis.del(key);
  } else {
    memoryStore.delete(key);
  }
}

export async function getAllSessions(pattern: string): Promise<string[]> {
  if (redis) {
    return await redis.keys(pattern);
  } else {
    return Array.from(memoryStore.keys()).filter(key => key.includes(pattern));
  }
}
