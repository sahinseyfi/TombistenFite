import { S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { env } from "@/env";

const bucket = env.S3_BUCKET;
const region = env.S3_REGION ?? "us-east-1";

let s3Client: S3Client | null = null;

function ensureClient() {
  if (!bucket) {
    throw new Error("S3_BUCKET tanımlı değil.");
  }

  if (!s3Client) {
    s3Client = new S3Client({
      region,
      endpoint: env.S3_ENDPOINT,
      forcePathStyle: Boolean(env.S3_ENDPOINT),
      credentials:
        env.S3_ACCESS_KEY && env.S3_SECRET_KEY
          ? {
              accessKeyId: env.S3_ACCESS_KEY,
              secretAccessKey: env.S3_SECRET_KEY,
            }
          : undefined,
    });
  }

  return s3Client;
}

export type PresignParams = {
  key: string;
  contentType: string;
  maxSize: number;
  expiresInSeconds: number;
};

export async function createUploadPresign({ key, contentType, maxSize, expiresInSeconds }: PresignParams) {
  const client = ensureClient();

  const presign = await createPresignedPost(client, {
    Bucket: bucket!,
    Key: key,
    Expires: expiresInSeconds,
    Fields: {
      "Content-Type": contentType,
    },
    Conditions: [["content-length-range", 0, maxSize]],
  });

  return presign;
}

export function buildPublicUrl(key: string) {
  if (env.S3_ENDPOINT?.includes("localhost")) {
    return `${env.S3_ENDPOINT}/${bucket}/${key}`;
  }

  if (env.S3_BUCKET && region) {
    return `https://${env.S3_BUCKET}.s3.${region}.amazonaws.com/${key}`;
  }

  return key;
}
