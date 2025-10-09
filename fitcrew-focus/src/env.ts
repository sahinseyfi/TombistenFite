import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]),
    APP_URL: z.string().url().default("http://localhost:3000"),
    DATABASE_URL: z.string()
      .url()
      .default("postgresql://postgres:postgres@localhost:5432/fitcrew_focus"),
    DIRECT_URL: z.string().url().optional(),
    JWT_SECRET: z
      .string()
      .min(32, "JWT_SECRET en az 32 karakter olmalı")
      .default("local-dev-secret-key-please-change-123456"),
    JWT_ACCESS_EXPIRY: z.string().default("15m"),
    JWT_REFRESH_EXPIRY: z.string().default("7d"),
    REDIS_URL: z.string().url().optional(),
    S3_ENDPOINT: z.string().url().optional(),
    S3_REGION: z.string().optional(),
    S3_ACCESS_KEY: z.string().optional(),
    S3_SECRET_KEY: z.string().optional(),
    S3_BUCKET: z.string().optional(),
    OPENAI_API_KEY: z.string().optional(),
    OPENAI_MODEL: z.string().optional(),
    RATELIMIT_POSTS_PER_MIN: z.coerce.number().optional(),
    RATELIMIT_COMMENTS_PER_MIN: z.coerce.number().optional(),
    RATELIMIT_SPINS_PER_DAY: z.coerce.number().optional(),
    TREAT_SPIN_COOLDOWN_DAYS: z.coerce.number().optional(),
    TREAT_WEEKLY_LIMIT: z.coerce.number().optional(),
    EMA_WINDOW_DAYS: z.coerce.number().optional(),
    TREAT_MIN_WEIGHT_LOSS_KG: z.coerce.number().optional(),
    TREAT_MIN_WEIGHT_LOSS_PERCENT: z.coerce.number().optional(),
    TREAT_MIN_MEASUREMENT_DAYS: z.coerce.number().optional(),
    BONUS_WALK_DISTRIBUTION: z.string().optional(),
    PLATEAU_SPIN_ENABLED: z
      .string()
      .optional()
      .transform((value) => (value ? value.toLowerCase() === "true" : undefined)),
    PLATEAU_DAYS: z.coerce.number().optional(),
    PLATEAU_MIN_MEASUREMENTS: z.coerce.number().optional(),
    PLATEAU_EMA_RANGE_KG: z.coerce.number().optional(),
    NEW_USER_SPIN_ENABLED: z
      .string()
      .optional()
      .transform((value) => (value ? value.toLowerCase() === "true" : undefined)),
    NEW_USER_DAYS: z.coerce.number().optional(),
    NEW_USER_MIN_MEASUREMENTS: z.coerce.number().optional(),
    NEW_USER_MIN_WEIGHT_LOSS_KG: z.coerce.number().optional(),
  },
  client: {},
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    APP_URL: process.env.APP_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_ACCESS_EXPIRY: process.env.JWT_ACCESS_EXPIRY,
    JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY,
    REDIS_URL: process.env.REDIS_URL,
    S3_ENDPOINT: process.env.S3_ENDPOINT,
    S3_REGION: process.env.S3_REGION,
    S3_ACCESS_KEY: process.env.S3_ACCESS_KEY,
    S3_SECRET_KEY: process.env.S3_SECRET_KEY,
    S3_BUCKET: process.env.S3_BUCKET,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_MODEL: process.env.OPENAI_MODEL,
    RATELIMIT_POSTS_PER_MIN: process.env.RATELIMIT_POSTS_PER_MIN,
    RATELIMIT_COMMENTS_PER_MIN: process.env.RATELIMIT_COMMENTS_PER_MIN,
    RATELIMIT_SPINS_PER_DAY: process.env.RATELIMIT_SPINS_PER_DAY,
    TREAT_SPIN_COOLDOWN_DAYS: process.env.TREAT_SPIN_COOLDOWN_DAYS,
    TREAT_WEEKLY_LIMIT: process.env.TREAT_WEEKLY_LIMIT,
    EMA_WINDOW_DAYS: process.env.EMA_WINDOW_DAYS,
    TREAT_MIN_WEIGHT_LOSS_KG: process.env.TREAT_MIN_WEIGHT_LOSS_KG,
    TREAT_MIN_WEIGHT_LOSS_PERCENT: process.env.TREAT_MIN_WEIGHT_LOSS_PERCENT,
    TREAT_MIN_MEASUREMENT_DAYS: process.env.TREAT_MIN_MEASUREMENT_DAYS,
    BONUS_WALK_DISTRIBUTION: process.env.BONUS_WALK_DISTRIBUTION,
    PLATEAU_SPIN_ENABLED: process.env.PLATEAU_SPIN_ENABLED,
    PLATEAU_DAYS: process.env.PLATEAU_DAYS,
    PLATEAU_MIN_MEASUREMENTS: process.env.PLATEAU_MIN_MEASUREMENTS,
    PLATEAU_EMA_RANGE_KG: process.env.PLATEAU_EMA_RANGE_KG,
    NEW_USER_SPIN_ENABLED: process.env.NEW_USER_SPIN_ENABLED,
    NEW_USER_DAYS: process.env.NEW_USER_DAYS,
    NEW_USER_MIN_MEASUREMENTS: process.env.NEW_USER_MIN_MEASUREMENTS,
    NEW_USER_MIN_WEIGHT_LOSS_KG: process.env.NEW_USER_MIN_WEIGHT_LOSS_KG,
  },
  emptyStringAsUndefined: true,
  skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
});

export type Env = typeof env;
