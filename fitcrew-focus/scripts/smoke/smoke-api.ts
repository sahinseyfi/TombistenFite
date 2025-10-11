import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";

type StepResult = {
  name: string;
  success: boolean;
  message?: string;
  durationMs: number;
};

const port = Number.parseInt(process.env.SMOKE_PORT ?? "3100", 10);
const baseUrl = `http://127.0.0.1:${port}`;

async function waitForServer(timeoutMs: number) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/api/posts?scope=public`, {
        headers: { accept: "application/json" },
      });
      if (response.ok || response.status === 304) {
        return;
      }
    } catch {
      // ignore connection errors while booting
    }
    await delay(500);
  }
  throw new Error(`Server did not respond within ${timeoutMs} ms`);
}

type RequestOptions = {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
};

async function requestJson(path: string, options: RequestOptions = {}) {
  const headers: Record<string, string> = {
    accept: "application/json",
    ...(options.headers ?? {}),
  };

  let body: string | undefined;
  if (options.body !== undefined) {
    headers["content-type"] = "application/json";
    body = JSON.stringify(options.body);
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method ?? "GET",
    headers,
    body,
  });

  let payload: unknown = null;
  const text = await response.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch (error) {
      throw new Error(`JSON parse error for ${path}: ${(error as Error).message}\nBody: ${text}`);
    }
  }

  return { response, payload };
}

async function runStep(
  name: string,
  fn: () => Promise<void>,
  results: StepResult[],
) {
  const startedAt = Date.now();
  try {
    await fn();
    const durationMs = Date.now() - startedAt;
    results.push({ name, success: true, durationMs });
    console.log(`✔ ${name} (${durationMs} ms)`);
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    const message = error instanceof Error ? error.message : String(error);
    results.push({ name, success: false, durationMs, message });
    console.error(`✖ ${name} (${durationMs} ms)\n   ${message}`);
    throw error;
  }
}

function createServer() {
  const child = spawn("pnpm", ["dev"], {
    env: {
      ...process.env,
      PORT: String(port),
      HOSTNAME: "127.0.0.1",
      NEXT_TELEMETRY_DISABLED: "1",
    },
    stdio: ["ignore", "pipe", "pipe"],
    cwd: process.cwd(),
  });

  const logPrefix = "[next-dev]";
  child.stdout?.on("data", (chunk) => {
    process.stdout.write(`${logPrefix} ${chunk}`);
  });
  child.stderr?.on("data", (chunk) => {
    process.stderr.write(`${logPrefix} ${chunk}`);
  });

  return child;
}

async function stopServer(child: ReturnType<typeof spawn>) {
  if (child.killed) {
    return;
  }

  const exitPromise = new Promise<void>((resolve) => {
    child.once("exit", () => resolve());
  });

  child.kill("SIGTERM");
  await Promise.race([exitPromise, delay(5000).then(() => undefined)]);
}

async function main() {
  console.log("FitCrew Focus smoke testi basliyor...");
  const server = createServer();
  let serverExited = false;

  server.once("exit", (code) => {
    serverExited = true;
    if (code !== 0) {
      console.error(`Next.js dev server exited with code ${code}`);
    }
  });

  process.on("SIGINT", async () => {
    await stopServer(server);
    process.exit(130);
  });

  try {
    await waitForServer(60_000);
  } catch (error) {
    await stopServer(server);
    throw error;
  }

  if (serverExited) {
    throw new Error("Next.js dev server terminated before smoke test started.");
  }

  const suffix = randomUUID().replace(/-/g, "").slice(0, 12);
  const email = `smoke.${suffix}@fitcrew.dev`;
  const handle = `smoke_${suffix}`;
  const password = "SmokeTest123!";
  const accessTokens: string[] = [];

  const stats: StepResult[] = [];
  let failure: Error | null = null;

  try {
    await runStep("GET /api/posts public feed", async () => {
      const { response, payload } = await requestJson("/api/posts?scope=public");
      if (!response.ok) {
        throw new Error(`Beklenen 200, alinan ${response.status}`);
      }
      if (typeof payload !== "object" || payload === null || !Array.isArray((payload as any).posts)) {
        throw new Error("posts dizisi bulunamadi.");
      }
    }, stats);

    await runStep("POST /api/auth/register", async () => {
      const { response, payload } = await requestJson("/api/auth/register", {
        method: "POST",
        body: {
          email,
          password,
          name: "Smoke Test",
          handle,
        },
      });
      if (response.status !== 201) {
        throw new Error(`Beklenen 201, alinan ${response.status}: ${JSON.stringify(payload)}`);
      }

      const data = payload as any;
      if (!data?.tokens?.accessToken || typeof data.tokens.accessToken !== "string") {
        throw new Error("accessToken alanina ulasilamadi.");
      }
      accessTokens.push(data.tokens.accessToken);
    }, stats);

    await runStep("POST /api/auth/login", async () => {
      const { response, payload } = await requestJson("/api/auth/login", {
        method: "POST",
        body: {
          email,
          password,
        },
      });
      if (response.status !== 200) {
        throw new Error(`Beklenen 200, alinan ${response.status}: ${JSON.stringify(payload)}`);
      }

      const data = payload as any;
      if (!data?.tokens?.accessToken || typeof data.tokens.accessToken !== "string") {
        throw new Error("login cevabinda accessToken bulunamadi.");
      }
      accessTokens.push(data.tokens.accessToken);
    }, stats);

    const viewerToken = accessTokens.at(-1);
    if (!viewerToken) {
      throw new Error("Kullanici tokeni elde edilemedi.");
    }

    await runStep("POST /api/posts create", async () => {
      const { response, payload } = await requestJson("/api/posts", {
        method: "POST",
        headers: {
          authorization: `Bearer ${viewerToken}`,
        },
        body: {
          caption: "Smoke test postu",
          weightKg: 82.2,
        },
      });
      if (response.status !== 201) {
        throw new Error(`Beklenen 201, alinan ${response.status}: ${JSON.stringify(payload)}`);
      }

      const data = payload as any;
      if (!data?.post?.id || typeof data.post.id !== "string") {
        throw new Error("Olusturulan gonderi kimligi alinamadi.");
      }
    }, stats);

    await runStep("GET /api/posts public after create", async () => {
      const { response, payload } = await requestJson("/api/posts?scope=public");
      if (!response.ok) {
        throw new Error(`Beklenen 200, alinan ${response.status}`);
      }

      const data = payload as any;
      const posts = Array.isArray(data?.posts) ? data.posts : [];
      const found = posts.some((item: any) => item?.author?.handle === handle);
      if (!found) {
        throw new Error("Olusturulan gonderi public feed icinde bulunamadi.");
      }
    }, stats);

    await runStep("GET /api/treats/eligibility", async () => {
      const { response, payload } = await requestJson("/api/treats/eligibility", {
        headers: {
          authorization: `Bearer ${viewerToken}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Beklenen 200, alinan ${response.status}: ${JSON.stringify(payload)}`);
      }

      const data = payload as any;
      if (!data?.eligibility) {
        throw new Error("eligibility verisi bulunamadi.");
      }
    }, stats);

    await runStep("POST /api/ai-comments/run", async () => {
      const cronSecret = process.env.AI_COMMENT_CRON_SECRET ?? "local-cron-secret";
      const { response, payload } = await requestJson("/api/ai-comments/run", {
        method: "POST",
        headers: {
          authorization: `Bearer ${cronSecret}`,
        },
        body: { count: 1 },
      });
      if (!response.ok) {
        throw new Error(`Beklenen 200, alinan ${response.status}: ${JSON.stringify(payload)}`);
      }

      const data = payload as any;
      if (!Array.isArray(data?.results)) {
        throw new Error("results dizisi bulunamadi.");
      }
    }, stats);
  } catch (error) {
    failure = error instanceof Error ? error : new Error(String(error));
  } finally {
    await stopServer(server);
  }

  console.log("\nSmoke testi tamamlandi:");
  stats.forEach((item) => {
    const status = item.success ? "PASS" : "FAIL";
    console.log(`- ${status} ${item.name} (${item.durationMs} ms)`);
    if (!item.success && item.message) {
      console.log(`  Ayrinti: ${item.message}`);
    }
  });

  if (failure || !stats.every((item) => item.success)) {
    if (failure) {
      console.error("\nSmoke testi basarisiz:", failure);
    }
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("Beklenmeyen smoke testi hatasi:", error);
  process.exitCode = 1;
});
