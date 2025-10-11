import Redis from "ioredis";
import { env } from "@/env";

let client: Redis | null = null;

function createClient() {
  if (!env.REDIS_URL) {
    return null;
  }

  return new Redis(env.REDIS_URL, {
    lazyConnect: true,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
  });
}

export function getRedisClient() {
  if (client) {
    return client;
  }

  client = createClient();
  return client;
}

export function resetRedisClient() {
  client?.disconnect();
  client = null;
}
