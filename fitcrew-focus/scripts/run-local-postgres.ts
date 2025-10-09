import EmbeddedPostgres from "embedded-postgres";
import { spawn } from "node:child_process";
import os from "node:os";
import path from "node:path";
import fs from "node:fs/promises";

const PORT = 6543;
const DB_NAME = "fitcrew_focus";
const DB_USER = "postgres";
const DB_PASSWORD = "postgres";

async function runCommand(command: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: false,
      env: {
        ...process.env,
        DATABASE_URL: getConnectionString(),
        DIRECT_URL: getConnectionString(),
      },
    });

    child.on("error", (error) => reject(error));
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} ${args.join(" ")} exited with code ${code}`));
      }
    });
  });
}

function getConnectionString() {
  return `postgresql://${DB_USER}:${DB_PASSWORD}@127.0.0.1:${PORT}/${DB_NAME}`;
}

async function main() {
  const dataDir = path.join(os.tmpdir(), "fitcrew-focus-pg");
  await fs.mkdir(dataDir, { recursive: true });

  const postgres = new EmbeddedPostgres({
    port: PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    persistent: false,
    initdbFlags: ["--locale=en_US.UTF-8", "--encoding=UTF8"],
    databaseDir: dataDir,
    onLog: (message) => {
      process.stdout.write(`[pg-log] ${message}`);
    },
    onError: (message) => {
      process.stderr.write(`[pg-error] ${String(message)}\n`);
    },
  });

  await postgres.initialise();
  await postgres.start();
  await postgres.createDatabase(DB_NAME);

  console.log(`Embedded Postgres started at ${getConnectionString()}`);

  await runCommand("pnpm", ["prisma", "migrate", "dev", "--name", "init"]);
  await runCommand("pnpm", ["prisma", "db", "seed"]);

  await postgres.stop();
  console.log("Embedded Postgres stopped.");
}

main().catch(async (error) => {
  console.error("Failed to run migrations:", error);
  process.exitCode = 1;
});
