import app from "./app";
import { env } from "./config/env";
import { prisma } from "./config/prisma";

const server = app.listen(env.port, () => {
  console.log(`API running on port ${env.port}`);
});

const shutdown = async (signal: string) => {
  console.log(`${signal} received; shutting down`);

  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });

  setTimeout(() => process.exit(1), 10_000).unref();
};

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
